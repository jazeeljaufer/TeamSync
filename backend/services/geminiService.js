const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require("../models/User");
const Project = require("../models/Project");
const Report = require("../models/Report");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getUsersTool = async () => {
  return await User.find({ role: { $in: ["TEAM_MEMBER", "MANAGER", "ADMIN"] } })
    .select("name email role projects")
    .populate("projects", "name");
};

const getProjectsTool = async () => {
  return await Project.find()
    .populate("assignedMembers", "name email role")
    .populate("createdBy", "name email");
};

const getReportsTool = async (filters = {}) => {
  const query = {};
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.weekStart || filters.weekEnd) {
    query.weekStart = {};
    if (filters.weekStart) {
      const start = new Date(filters.weekStart);
      if (!isNaN(start.getTime())) {
        const startOfDay = new Date(start);
        startOfDay.setUTCHours(0, 0, 0, 0);
        query.weekStart.$gte = startOfDay;
      }
    }
    if (filters.weekEnd) {
      const end = new Date(filters.weekEnd);
      if (!isNaN(end.getTime())) {
        const endOfDay = new Date(end);
        endOfDay.setUTCHours(23, 59, 59, 999);
        query.weekStart.$lte = endOfDay;
      }
    }
  }

  let reports = await Report.find(query)
    .populate("user", "name email role")
    .populate("project", "name description status")
    .sort({ weekStart: -1 })
    .limit(100);

  if (filters.userName) {
    const regex = new RegExp(filters.userName, "i");
    reports = reports.filter(r => r.user && regex.test(r.user.name));
  }

  if (filters.projectName) {
    const regex = new RegExp(filters.projectName, "i");
    reports = reports.filter(r => r.project && regex.test(r.project.name));
  }

  return reports.map(r => ({
    id: r._id,
    user: r.user ? { name: r.user.name, email: r.user.email, role: r.user.role } : null,
    project: r.project ? { name: r.project.name, description: r.project.description, status: r.project.status } : null,
    weekStart: r.weekStart,
    weekEnd: r.weekEnd,
    tasksCompleted: r.tasksCompleted,
    tasksPlanned: r.tasksPlanned,
    blockers: r.blockers,
    hoursWorked: r.hoursWorked,
    notes: r.notes,
    status: r.status,
    submittedAt: r.submittedAt
  }));
};

const tools = [
  {
    functionDeclarations: [
      {
        name: "getUsers",
        description: "Fetch a list of all team members and users in the system, including their names, emails, roles, and assigned projects. Use this to see who is on the team or check their roles.",
      },
      {
        name: "getProjects",
        description: "Fetch a list of all projects and categories in the system, including project name, status, assigned members, and description.",
      },
      {
        name: "getWeeklyReports",
        description: "Fetch weekly reports with optional filters. Use this to answer questions about tasks completed, tasks planned, hours worked, blockers, or to summarize team activities for a given week.",
        parameters: {
          type: "OBJECT",
          properties: {
            weekStart: {
              type: "STRING",
              description: "Filter by week start date (ISO format or YYYY-MM-DD representing Monday of that week)."
            },
            weekEnd: {
              type: "STRING",
              description: "Filter by week end date (ISO format or YYYY-MM-DD representing Sunday of that week)."
            },
            userName: {
              type: "STRING",
              description: "Case-insensitive name of a team member to filter reports."
            },
            projectName: {
              type: "STRING",
              description: "Case-insensitive name of a project to filter reports."
            },
            status: {
              type: "STRING",
              description: "Filter by report status: 'DRAFT' or 'SUBMITTED'."
            }
          }
        }
      }
    ]
  }
];

const generateSummary = async (reports, question) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    let prompt = `
You are an AI Project Manager Assistant for a software team.
Here is the context containing the team's weekly reports:

${JSON.stringify(reports, null, 2)}
`;

    if (question) {
      prompt += `
The Manager has asked: "${question}"
Please answer this question concisely and accurately based on the reports context above. If the information is not present in the reports, let the manager know.
`;
    } else {
      prompt += `
Please analyze the weekly reports and generate a structured summary including:
1. Overall team summary
2. Completed work
3. Pending work
4. Major blockers
5. Workload imbalance (who has too much/too little work)
6. Suggestions for next week
`;
    }

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return "Unable to generate summary.";
  }
};

const generateAIChatResponse = async (message, history = [], userContext = {}) => {
  try {
    const systemInstruction = `
You are TeamSync AI, a secure, helpful, and highly precise AI Assistant for managers in the TeamSync Weekly Report System.
The current local date and time is: ${new Date().toString()}.

[SYSTEM KNOWLEDGE]
- Workflow: Team members submit weekly reports containing tasks completed, tasks planned, blockers, hours worked, and notes.
- Reports: Submitted weekly (Monday to Sunday). Reports can be in DRAFT or SUBMITTED status. Once submitted, they cannot be edited.
- Projects: Created by managers/admins. Statuses are ACTIVE, COMPLETED, ON_HOLD. Team members are assigned to projects.
- Dashboards:
  - Manager Dashboard shows aggregates (total team members, total reports, pending reports, blockers) and a report list.
  - Team Member Dashboard shows their own reports and summary metrics.
- Analytics: Shows workload by project, submission status chart, and task completion trends.
- Permissions:
  - TEAM_MEMBER: Can create/edit/view their own reports.
  - MANAGER: Full read access to all reports, users, and projects. Can create/manage projects. Has access to the AI Chat Widget.
  - ADMIN: Same permissions as MANAGER.

[BEHAVIORAL GUIDELINES]
- NEVER hallucinate database facts. If a query returns no results or is missing, clearly state that the information was not found.
- If asked a question about live data, ALWAYS use the provided tool calls to fetch the live database state first. Do not guess or assume.
- If asked a question about system features/rules, explain using the built-in system knowledge.
- Format responses beautifully using GitHub-flavored Markdown. Use tables, bold text, or lists where appropriate to make data easy to read.
- Keep responses professional, clear, and actionable.
- Restrict your answers strictly to what is available in the database or system knowledge. If you cannot find something, say "I couldn't find that information in the database."

[DATES AND TIME CALCULATIONS]
- Today's date is given above.
- The reporting week runs from Monday to Sunday.
- When the user asks about "this week", "last week", or a specific range, calculate the Monday date (weekStart) and Sunday date (weekEnd) based on today's date, then use those dates in your queries.
- For example, if today is Thursday, July 9, 2026:
  - "this week" started on Monday, July 6, 2026 (weekStart: "2026-07-06") and ends on Sunday, July 12, 2026 (weekEnd: "2026-07-12").
  - "last week" started on Monday, June 29, 2026 (weekStart: "2026-06-29") and ended on Sunday, July 5, 2026 (weekEnd: "2026-07-05").

[PENDING REPORTS LOGIC]
- To find who has pending reports for a specific week:
  1. Call \`getUsers\` to retrieve all users. Filter for role: "TEAM_MEMBER".
  2. Call \`getWeeklyReports\` for that week with status: "SUBMITTED".
  3. Compare the list of all team members with the list of submitted reports. Any team member who does not have a submitted report for that week has a "pending report".
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: tools,
      systemInstruction: systemInstruction,
    });

    const formattedHistory = history.map(h => ({
      role: h.sender === "user" ? "user" : (h.sender === "system" ? "system" : "assistant"),
      parts: [{ text: h.text }]
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    let result = await chat.sendMessage(message);

    let functionCalls = (typeof result.functionCalls === "function" ? result.functionCalls() : result.functionCalls) || [];
    
    while (functionCalls.length > 0) {
      const functionResponses = [];
      
      for (const call of functionCalls) {
        const { name, args } = call;
        let toolResult;
        
        try {
          if (name === "getUsers") {
            toolResult = await getUsersTool();
          } else if (name === "getProjects") {
            toolResult = await getProjectsTool();
          } else if (name === "getWeeklyReports") {
            toolResult = await getReportsTool(args);
          } else {
            toolResult = { error: `Tool ${name} not found.` };
          }
        } catch (error) {
          toolResult = { error: error.message };
        }
        
        functionResponses.push({
          functionResponse: {
            name: name,
            response: { result: toolResult }
          }
        });
      }
      
      result = await chat.sendMessage(functionResponses);
      functionCalls = (typeof result.functionCalls === "function" ? result.functionCalls() : result.functionCalls) || [];
    }

    return result.response.text();
  } catch (error) {
    return "An error occurred while communicating with the AI Assistant. Please check server logs.";
  }
};

module.exports = {
  generateSummary,
  generateAIChatResponse,
};
