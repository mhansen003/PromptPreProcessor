import type { PersonaConfig } from '@/lib/store';
import { Slider } from '../Slider';
import { Select } from '../Select';
import { Toggle } from '../Toggle';

interface RegionalTabProps {
  config: PersonaConfig;
  onUpdate: (updates: Partial<PersonaConfig>) => void;
}

const US_STATES = [
  '', 'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming', 'Washington D.C.'
];

export default function RegionalTab({ config, onUpdate }: RegionalTabProps) {
  return (
    <div className="space-y-8">
      {/* Info Box */}
      <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-orange-400">Regional Settings</span> help tailor responses to specific geographic contexts, local markets, and cultural considerations. This is particularly useful for location-specific mortgage and real estate discussions.
        </p>
      </div>

      {/* Location Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>🗺️</span>
          <span>Location Settings</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Region"
            value={config.region}
            onChange={(value) => onUpdate({ region: value as PersonaConfig['region'] })}
            options={[
              { value: 'none', label: 'None / Not Applicable' },
              { value: 'national', label: 'National (US-wide)' },
              { value: 'northeast', label: 'Northeast' },
              { value: 'southeast', label: 'Southeast' },
              { value: 'midwest', label: 'Midwest' },
              { value: 'southwest', label: 'Southwest' },
              { value: 'west', label: 'West Coast' },
              { value: 'pacific-northwest', label: 'Pacific Northwest' },
              { value: 'mountain-west', label: 'Mountain West' },
            ]}
            tooltip="General geographic region for context and market references"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              State
            </label>
            <select
              value={config.state || ''}
              onChange={(e) => onUpdate({ state: e.target.value })}
              className="w-full px-3 py-2 bg-robinhood-card border border-robinhood-card-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-robinhood-green"
            >
              <option value="">-- Select State --</option>
              {US_STATES.filter(state => state).map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400">
              Required for local context features below
            </p>
          </div>
        </div>
      </div>

      {/* Local Context & References */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>🏘️</span>
          <span>Local Context</span>
          {!config.state && (
            <span className="text-xs text-gray-500 font-normal">(Select a state first)</span>
          )}
        </h3>

        <div className="space-y-3">
          <Toggle
            label="Include Local References"
            checked={config.includeLocalReferences}
            onChange={(checked) => onUpdate({ includeLocalReferences: checked })}
            description="Reference local landmarks, culture, events, and regional characteristics"
            disabled={!config.state}
          />

          <Toggle
            label="Time Zone Awareness"
            checked={config.timeZoneAwareness}
            onChange={(checked) => onUpdate({ timeZoneAwareness: checked })}
            description="Consider regional time zones when discussing time-sensitive topics"
            disabled={!config.state}
          />

          <Toggle
            label="Local Market Knowledge"
            checked={config.localMarketKnowledge}
            onChange={(checked) => onUpdate({ localMarketKnowledge: checked })}
            description="Include local real estate market insights, pricing trends, and regional mortgage practices"
            disabled={!config.state}
          />
        </div>
      </div>

      {/* Dialect & Communication Style */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>🗣️</span>
          <span>Dialect & Communication</span>
        </h3>

        <Select
          label="Dialect / Speaking Style"
          value={config.dialect}
          onChange={(value) => onUpdate({ dialect: value as PersonaConfig['dialect'] })}
          options={[
            { value: 'neutral', label: 'Neutral (No specific dialect)' },
            { value: 'standard-american', label: 'Standard American English' },
            { value: 'southern', label: 'Southern Dialect' },
            { value: 'midwestern', label: 'Midwestern Dialect' },
            { value: 'northeast', label: 'Northeast Dialect (NY/Boston)' },
            { value: 'california', label: 'California / West Coast' },
          ]}
          tooltip="Regional dialect and speaking patterns to incorporate"
        />

        <Slider
          label="Regional Terminology"
          value={config.regionalTerminology}
          onChange={(value) => onUpdate({ regionalTerminology: value })}
          min={0}
          max={100}
          tooltip="How much to use region-specific terms and phrases (0 = generic language, 100 = heavy regional terminology)"
        />
      </div>


      {/* Cultural Sensitivity */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>🌍</span>
          <span>Cultural Awareness</span>
        </h3>

        <Slider
          label="Cultural Sensitivity"
          value={config.culturalSensitivity}
          onChange={(value) => onUpdate({ culturalSensitivity: value })}
          min={0}
          max={100}
          tooltip="How culturally aware and sensitive responses should be (0 = general approach, 100 = highly attuned to cultural nuances and diversity)"
        />
      </div>
    </div>
  );
}
