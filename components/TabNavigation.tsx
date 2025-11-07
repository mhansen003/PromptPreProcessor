interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'personality', label: 'Personality', icon: '🎭' },
    { id: 'structure', label: 'Response Structure', icon: '📝' },
    { id: 'regional', label: 'Regional', icon: '🗺️' },
    { id: 'role', label: 'Role', icon: '💼' },
    { id: 'advanced', label: 'Advanced', icon: '⚙️' },
  ];

  return (
    <div className="flex gap-1 border-b border-robinhood-card-border bg-robinhood-darker/50 px-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-6 py-3 text-sm font-medium transition-all relative ${
            activeTab === tab.id
              ? 'text-robinhood-green'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </span>
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-robinhood-green" />
          )}
        </button>
      ))}
    </div>
  );
}
