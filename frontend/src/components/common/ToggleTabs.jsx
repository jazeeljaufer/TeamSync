import "./ToggleTabs.css";

const tabs = [
  { value: "login", label: "Login" },
  { value: "register", label: "Register" },
];

const ToggleTabs = ({ active, setActive }) => (
  <div className="toggle-tabs" role="tablist" aria-label="Authentication mode">
    {tabs.map((tab) => (
      <button
        key={tab.value}
        type="button"
        className={`toggle-tabs__button ${
          active === tab.value ? "toggle-tabs__button--active" : ""
        }`}
        role="tab"
        aria-selected={active === tab.value}
        onClick={() => setActive(tab.value)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default ToggleTabs;
