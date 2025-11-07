import type { PersonaConfig } from '@/lib/store';
import { Slider } from '../Slider';
import { Select } from '../Select';
import { useState } from 'react';

interface RoleTabProps {
  config: PersonaConfig;
  onUpdate: (updates: Partial<PersonaConfig>) => void;
}

const LOAN_TYPES = [
  '30-Year Fixed', '15-Year Fixed', '20-Year Fixed', '10-Year Fixed',
  '5/1 ARM', '7/1 ARM', '10/1 ARM',
  'FHA 203(b)', 'FHA 203(k) Rehab', 'FHA Streamline',
  'VA Purchase', 'VA IRRRL', 'VA Cash-Out',
  'Conventional 97', 'Conventional', 'Jumbo',
  'USDA Rural', 'Reverse Mortgage (HECM)',
  'Non-QM', 'Bank Statement', 'DSCR', 'Construction-to-Perm',
];

const MARKET_EXPERTISE_OPTIONS = [
  'Purchase', 'Refinance', 'Cash-Out Refinance', 'Rate & Term Refi',
  'HELOC', 'Home Equity Loan', 'Second Mortgages',
  'First-Time Homebuyers', 'Move-Up Buyers', 'Luxury Market',
  'Investment Properties', 'Multi-Family (2-4 units)', 'Condos',
  'New Construction', 'Renovation Loans', 'Bridge Loans',
];

export default function RoleTab({ config, onUpdate }: RoleTabProps) {
  const [specializationInput, setSpecializationInput] = useState('');
  const [loanTypeInput, setLoanTypeInput] = useState('');
  const [marketInput, setMarketInput] = useState('');

  const addSpecialization = (spec: string) => {
    if (spec && !config.specializations.includes(spec)) {
      onUpdate({ specializations: [...config.specializations, spec] });
    }
  };

  const removeSpecialization = (spec: string) => {
    onUpdate({ specializations: config.specializations.filter(s => s !== spec) });
  };

  const addLoanType = (type: string) => {
    if (type && !config.loanTypes.includes(type)) {
      onUpdate({ loanTypes: [...config.loanTypes, type] });
    }
  };

  const removeLoanType = (type: string) => {
    onUpdate({ loanTypes: config.loanTypes.filter(t => t !== type) });
  };

  const addMarketExpertise = (market: string) => {
    if (market && !config.marketExpertise.includes(market)) {
      onUpdate({ marketExpertise: [...config.marketExpertise, market] });
    }
  };

  const removeMarketExpertise = (market: string) => {
    onUpdate({ marketExpertise: config.marketExpertise.filter(m => m !== market) });
  };

  return (
    <div className="space-y-8">
      {/* Info Box */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-blue-400">Role Settings</span> tailor the persona to your specific mortgage and financial role, ensuring responses are relevant to your job responsibilities, expertise level, and client focus.
        </p>
      </div>

      {/* Job Role & Experience */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>💼</span>
          <span>Job Role & Experience</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Job Role"
            value={config.jobRole}
            onChange={(value) => onUpdate({ jobRole: value as PersonaConfig['jobRole'] })}
            options={[
              { value: 'general', label: 'General (No specific role)' },
              { value: 'loan-officer', label: 'Loan Officer / Mortgage Originator' },
              { value: 'processor', label: 'Loan Processor' },
              { value: 'underwriter', label: 'Underwriter' },
              { value: 'sales', label: 'Sales / Business Development' },
              { value: 'sales-assistant', label: 'Sales Assistant / Coordinator' },
              { value: 'branch-manager', label: 'Branch Manager' },
              { value: 'operations', label: 'Operations Manager' },
              { value: 'closer', label: 'Closer / Settlement Agent' },
              { value: 'account-executive', label: 'Account Executive' },
            ]}
            tooltip="Your specific role in the mortgage/financial industry"
          />

          <Select
            label="Team Role"
            value={config.teamRole}
            onChange={(value) => onUpdate({ teamRole: value as PersonaConfig['teamRole'] })}
            options={[
              { value: 'individual', label: 'Individual Contributor' },
              { value: 'team-lead', label: 'Team Lead' },
              { value: 'manager', label: 'Manager' },
              { value: 'executive', label: 'Executive / Director' },
            ]}
            tooltip="Your position within your team or organization"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Years of Experience: {config.yearsExperience} years
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={config.yearsExperience}
            onChange={(e) => onUpdate({ yearsExperience: parseInt(e.target.value) })}
            className="w-full h-2 bg-robinhood-card rounded-lg appearance-none cursor-pointer slider-thumb"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0 years (Entry-level)</span>
            <span>50+ years (Industry Veteran)</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Certifications & Licenses
          </label>
          <input
            type="text"
            value={config.certifications}
            onChange={(e) => onUpdate({ certifications: e.target.value })}
            placeholder="e.g., NMLS #123456, MLO Licensed, MBA, CPA"
            className="w-full px-3 py-2 bg-robinhood-card border border-robinhood-card-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-robinhood-green"
          />
          <p className="text-xs text-gray-400">
            List relevant certifications, licenses, and credentials
          </p>
        </div>
      </div>

      {/* Loan Programs & Products - 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Specializations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>⭐</span>
            <span>Loan Program Specializations</span>
          </h3>

          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={specializationInput}
                onChange={(e) => setSpecializationInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addSpecialization(specializationInput);
                    setSpecializationInput('');
                  }
                }}
                placeholder="Type and press Enter (e.g., FHA, VA, Jumbo)"
                className="flex-1 px-3 py-2 bg-robinhood-card border border-robinhood-card-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-robinhood-green text-sm"
              />
              <button
                onClick={() => {
                  addSpecialization(specializationInput);
                  setSpecializationInput('');
                }}
                className="px-3 py-2 bg-robinhood-green/20 text-robinhood-green border border-robinhood-green/30 rounded-lg hover:bg-robinhood-green/30 transition-colors text-sm"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[60px]">
              {config.specializations.map((spec) => (
                <span
                  key={spec}
                  className="px-3 py-1 bg-robinhood-green/20 text-robinhood-green text-sm rounded-full flex items-center gap-2 h-fit"
                >
                  {spec}
                  <button
                    onClick={() => removeSpecialization(spec)}
                    className="hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <p className="text-xs text-gray-400">
              Examples: FHA, VA, Conventional, Jumbo, Reverse, USDA
            </p>
          </div>
        </div>

        {/* Loan Products */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>📋</span>
            <span>Specific Loan Products</span>
          </h3>

          <div className="space-y-2">
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  addLoanType(e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full px-3 py-2 bg-robinhood-card border border-robinhood-card-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-robinhood-green text-sm"
            >
              <option value="">-- Select a loan product to add --</option>
              {LOAN_TYPES.filter(type => !config.loanTypes.includes(type)).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-2 min-h-[60px]">
              {config.loanTypes.map((type) => (
                <span
                  key={type}
                  className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full flex items-center gap-2 h-fit"
                >
                  {type}
                  <button
                    onClick={() => removeLoanType(type)}
                    className="hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Market Expertise - Full Width */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>🎯</span>
          <span>Market Expertise</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Primary Client Focus"
            value={config.clientFocus}
            onChange={(value) => onUpdate({ clientFocus: value as PersonaConfig['clientFocus'] })}
            options={[
              { value: 'mixed', label: 'Mixed (All client types)' },
              { value: 'first-time-buyers', label: 'First-Time Homebuyers' },
              { value: 'purchase', label: 'Purchase (Move-Up/Down)' },
              { value: 'refinance', label: 'Refinance Specialists' },
              { value: 'investors', label: 'Investors / Investment Properties' },
            ]}
            tooltip="Primary type of clients you work with most"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Additional Market Segments
            </label>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  addMarketExpertise(e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full px-3 py-2 bg-robinhood-card border border-robinhood-card-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-robinhood-green text-sm"
            >
              <option value="">-- Select a market segment to add --</option>
              {MARKET_EXPERTISE_OPTIONS.filter(opt => !config.marketExpertise.includes(opt)).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 min-h-[60px]">
          {config.marketExpertise.map((market) => (
            <span
              key={market}
              className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full flex items-center gap-2 h-fit"
            >
              {market}
              <button
                onClick={() => removeMarketExpertise(market)}
                className="hover:text-red-400 transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Knowledge & Compliance */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>📚</span>
          <span>Knowledge & Compliance</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Slider
            label="Product Knowledge Depth"
            value={config.productKnowledge}
            onChange={(value) => onUpdate({ productKnowledge: value })}
            min={0}
            max={100}
            tooltip="Depth of loan product knowledge to assume (0 = basic awareness, 100 = expert-level mastery)"
          />

          <Slider
            label="Compliance Emphasis"
            value={config.complianceEmphasis}
            onChange={(value) => onUpdate({ complianceEmphasis: value })}
            min={0}
            max={100}
            tooltip="How much to emphasize regulatory compliance and legal requirements (0 = minimal mention, 100 = compliance-focused)"
          />
        </div>
      </div>
    </div>
  );
}
