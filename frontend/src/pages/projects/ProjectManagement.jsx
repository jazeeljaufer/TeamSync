import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import { getProjects, createProject, updateProject, deleteProject } from "../../services/projectService";
import { getTeamMembers } from "../../services/authService";
import "./ProjectManagement.css";

const getStatusLabel = (status) => {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "ON_HOLD":
      return "On Hold";
    case "COMPLETED":
      return "Completed";
    default:
      return status || "Active";
  }
};

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ name: "", status: "ACTIVE", assignedMembers: [] });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getProjects();
      setProjects(response.projects || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await getTeamMembers();
      setTeamMembers(response.members || []);
    } catch {
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTeamMembers();
  }, []);

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        status: project.status || "ACTIVE",
        assignedMembers: project.assignedMembers?.map(m => m._id || m) || []
      });
    } else {
      setEditingProject(null);
      setFormData({ name: "", status: "ACTIVE", assignedMembers: [] });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await updateProject(editingProject._id, formData);
      } else {
        await createProject(formData);
      }
      await fetchProjects();
      handleCloseModal();
    } catch (error) {
      alert("Error saving project: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(id);
        await fetchProjects();
      } catch (error) {
        alert("Error deleting project: " + error.message);
      }
    }
  };

  return (
    <DashboardLayout activeItem="projects" title="Project Management" subtitle="Manage your team's projects and categories.">
      <div className="project-management-container">
        
        <div className="pm-header">
          <h3>All Projects</h3>
          <Button onClick={() => handleOpenModal()}>
            <span className="material-symbols-outlined">add</span>
            New Project
          </Button>
        </div>

        <div className="projects-grid">
          {loading ? (
            <div style={{ padding: "32px", textAlign: "center" }}>Loading projects...</div>
          ) : projects.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center" }}>No projects found.</div>
          ) : (
            projects.map((project) => (
              <div key={project._id} className="project-card">
                <div className="project-card-header">
                  <h4>{project.name}</h4>
                  <span className={`status-badge status-${(project.status || 'ACTIVE').toLowerCase().replace(/[\s_]+/g, '-')}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </div>
                <div className="project-card-body">
                  <div className="team-info">
                    <span className="material-symbols-outlined">group</span>
                    <span>{project.assignedMembers?.length || 0} Members</span>
                  </div>
                  {project.assignedMembers && project.assignedMembers.length > 0 && (
                    <div className="assigned-members-list">
                      {project.assignedMembers.map((m) => (
                        <span key={m._id || m} className="assigned-member-tag" title={m.email}>
                          {m.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="project-card-actions">
                  <button className="action-btn edit" onClick={() => handleOpenModal(project)} aria-label="Edit">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(project._id)} aria-label="Delete">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{editingProject ? 'Edit Project' : 'New Project'}</h2>
                <button className="close-btn" onClick={handleCloseModal}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="modal-form">
                <InputField
                  id="projectName"
                  name="name"
                  label="Project Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
                <div className="input-field" style={{ marginTop: '16px' }}>
                  <label className="input-field__label">Status</label>
                  <select 
                    className="input-field__input" 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div className="members-selection-container">
                  <label className="input-field__label">Assign Team Members</label>
                  <div className="members-checkbox-list">
                    {teamMembers.length === 0 ? (
                      <p className="no-members-text">No team members found.</p>
                    ) : (
                      teamMembers.map((member) => {
                        const isChecked = formData.assignedMembers.includes(member._id);
                        return (
                          <label key={member._id} className="member-checkbox-item">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const newMembers = e.target.checked
                                  ? [...formData.assignedMembers, member._id]
                                  : formData.assignedMembers.filter(id => id !== member._id);
                                setFormData({ ...formData, assignedMembers: newMembers });
                              }}
                            />
                            <span className="member-name">{member.name}</span>
                            <span className="member-email">({member.email})</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
                <div className="modal-actions">
                  <Button variant="outline" type="button" onClick={handleCloseModal}>Cancel</Button>
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProjectManagement;
