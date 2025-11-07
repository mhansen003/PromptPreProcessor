interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'personality', label: 'Personality', icon: '🎭', color: 'text-robinhood-green', borderColor: 'bg-robinhood-green' },
    { id: 'structure', label: 'Response Structure', icon: '📝', color: 'text-blue-400', borderColor: 'bg-blue-400' },
    { id: 'regional', label: 'Regional', icon: '🗺️', color: 'text-orange-400', borderColor: 'bg-orange-400' },
    { id: 'role', label: 'Role', icon: '💼', color: 'text-blue-400', borderColor: 'bg-blue-400' },
    { id: 'advanced', label: 'Advanced', icon: '⚙️', color: 'text-purple-400', borderColor: 'bg-purple-400' },
  ];

  return (
    <div className="sticky top-0 z-40 flex gap-1 border-b border-robinhood-card-border bg-robinhood-darker/95 backdrop-blur-sm px-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-6 py-3 text-sm font-medium transition-all relative ${
            activeTab === tab.id
              ? tab.color
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </span>
          {activeTab === tab.id && (
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${tab.borderColor}`} />
          )}
        </button>
      ))}
    </div>
  );
}
