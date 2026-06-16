import { Card } from '../../components/common/Card';
import { FormField } from '../../components/common/FormField';
import { ModeSelector } from '../../components/wizard/ModeSelector';
import { useAnalysis } from '../../context/AnalysisContext';
import type { Currency } from '../../types/analysis';
// import { LocationAutocomplete } from "../../components/common/LocationAutocomplete";
import { useState } from 'react';
import { LocationMap } from "../../components/common/LocationMap";



export function ProjectSetupStep() {
  const { state, updateInput } = useAnalysis();
  const { inputs } = state;
  const [loading, setLoading] = useState(false);

//  const handleShowLocation = async () => {
//   console.log(
//     inputs.latitude,
//     inputs.longitude
//   );
// };


const fetchPSH = async (
    lat: number,
    lon: number
  ) => {
    try {
      const response = await fetch(
        `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${lon}&latitude=${lat}&format=JSON`
      );

      const data =
        await response.json();

      const psh =
        data.properties.parameter
            .ALLSKY_SFC_SW_DWN.ANN;

      updateInput("psh", psh);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="step-panel visible">
      <div className="panel-title">
        Project Setup <span>Step 1</span>
      </div>
      <div className="panel-sub">Location, system mode and financial parameters</div>
      <Card title="🌍 Location & Project">
        <div className="form-grid">
          <FormField label="Project Name" value={inputs.projectName} onChange={(value) => updateInput('projectName', String(value))} />
          <FormField
              label="Coordinates (Lat, Lon)"
                value={`${inputs.latitude}, ${inputs.longitude}`}
                onChange={(value) => {
                const coords = String(value).split(",");

                      if (coords.length === 2) {
                        updateInput(
                          "latitude",
                          Number(coords[0].trim())
                        );

                        updateInput(
                          "longitude",
                          Number(coords[1].trim())
                        );
                      }
                  }}
                    placeholder="28.6139, 77.2090"
          />
          </div>
          <div className='mt-6'>
            <LocationMap 
              latitude={inputs.latitude}
              longitude={inputs.longitude}
              onLocationChange={async(lat, lon)=>{
                updateInput("latitude",lat);
                updateInput("longitude",lon);

                await fetchPSH(lat,lon);
              }}
            />
          </div>
          {/* <FormField label="Peak Sun Hours (h/day)" type="number" value={inputs.psh} step="0.1" min="0" max="12" onChange={(value) => updateInput('psh', Number(value))} /> */}
          {/* <FormField label="Average Temperature (°C)" type="number" value={inputs.averageTemperature} step="0.1" onChange={(value) => updateInput('averageTemperature', Number(value))} /> */}
          <div className="form-grid mt-6">
          <FormField
            label="Currency"
            value={inputs.currency}
            onChange={(value) => updateInput('currency', value as Currency)}
            options={[
              { value: 'INR', label: '₹ Indian Rupee (INR)' },
              { value: 'USD', label: '$ US Dollar (USD)' },
              { value: 'EUR', label: '€ Euro (EUR)' },
            ]}
          />
          <FormField label="Grid Tariff (₹/kWh)" type="number" value={inputs.tariff} step="0.1" min="1" onChange={(value) => updateInput('tariff', Number(value))} />
          <FormField label="Grid Availability (%)" type="number" value={inputs.gridAvailability} min="0" max="100" onChange={(value) => updateInput('gridAvailability', Number(value))} />
          {/* <FormField label="Tariff Escalation (%/yr)" type="number" value={inputs.tariffEscalation} step="0.5" onChange={(value) => updateInput('tariffEscalation', Number(value))} />
          <FormField label="Discount Rate (%)" type="number" value={inputs.discountRate} step="0.5" onChange={(value) => updateInput('discountRate', Number(value))} />
          <FormField label="Project Life (years)" type="number" value={inputs.projectLife} min="10" max="30" onChange={(value) => updateInput('projectLife', Number(value))} /> */}
        </div>
      </Card>
      <Card title="⚡ System Mode">
        <ModeSelector />
      </Card>
    </div>
  );
}
