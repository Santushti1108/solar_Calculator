import type { SystemMode } from '../../types/analysis';
import { useAnalysis } from '../../context/AnalysisContext';
import { isEvMode } from '../../utils/calculations';
import { FormField } from '../common/FormField';

type SystemType = 'offgrid' | 'ongrid' | 'grid';
type Configuration = 'rts-bess' | 'rts-bess-ev' | 'bess' | 'bess-ev';

const systemTypeOptions = [
  { value: 'offgrid', label: 'Offgrid' },
  { value: 'ongrid', label: 'Ongrid' },
  { value: 'grid', label: 'Grid' },
];

const rtsConfigurationOptions = [
  { value: 'rts-bess', label: 'RTS + BESS' },
  { value: 'rts-bess-ev', label: 'RTS + BESS + EV' },
];

const gridConfigurationOptions = [
  { value: 'bess', label: 'BESS' },
  { value: 'bess-ev', label: 'BESS + EV' },
];

const evCostOptions = [
  { value: 'included', label: 'Included' },
  { value: 'excluded', label: 'Excluded' },
];

function getSystemType(mode: SystemMode): SystemType {
  if (mode.startsWith('offgrid')) return 'offgrid';
  if (mode.startsWith('ongrid')) return 'ongrid';
  return 'grid';
}

function getConfiguration(mode: SystemMode): Configuration {
  if (mode === 'grid-bess') return 'bess';
  if (mode === 'grid-bess-ev') return 'bess-ev';
  return isEvMode(mode) ? 'rts-bess-ev' : 'rts-bess';
}

function resolveSystemMode(systemType: SystemType, configuration: Configuration): SystemMode {
  if (systemType === 'grid') {
    return configuration === 'bess-ev' ? 'grid-bess-ev' : 'grid-bess';
  }

  const hasEv = configuration === 'rts-bess-ev' || configuration === 'bess-ev';
  if (systemType === 'offgrid') return hasEv ? 'offgrid-rts-bess-ev' : 'offgrid-rts-bess';
  return hasEv ? 'ongrid-rts-bess-ev' : 'ongrid-rts-bess';
}

export function ModeSelector() {
  const { state, setMode, updateInput } = useAnalysis();
  const { inputs } = state;
  const systemType = getSystemType(inputs.systemMode);
  const configuration = getConfiguration(inputs.systemMode);
  const configurationOptions = systemType === 'grid' ? gridConfigurationOptions : rtsConfigurationOptions;
  const showEvOptions = isEvMode(inputs.systemMode);

  const handleSystemTypeChange = (value: string | number | '') => {
    const nextSystemType = value as SystemType;
    const nextConfiguration = nextSystemType === 'grid'
      ? (showEvOptions ? 'bess-ev' : 'bess')
      : (showEvOptions ? 'rts-bess-ev' : 'rts-bess');
    setMode(resolveSystemMode(nextSystemType, nextConfiguration));
  };

  const handleConfigurationChange = (value: string | number | '') => {
    setMode(resolveSystemMode(systemType, value as Configuration));
  };

  return (
    <div className="form-grid">
      <FormField
        label="System Type"
        value={systemType}
        onChange={handleSystemTypeChange}
        options={systemTypeOptions}
      />
      <FormField
        label="Configuration"
        value={configuration}
        onChange={handleConfigurationChange}
        options={configurationOptions}
      />
      {showEvOptions ? (
        <FormField
          label="EV Cost"
          value={inputs.evCostOption}
          onChange={(value) =>
            updateInput(
              'evCostOption',
              value as 'included' | 'excluded'
            )
          }
          options={evCostOptions}
        />
      ) : null}
    </div>
  );
}
