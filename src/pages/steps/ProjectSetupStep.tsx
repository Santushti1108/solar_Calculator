import { Card } from '../../components/common/Card';
import { FormField } from '../../components/common/FormField';
import { ModeSelector } from '../../components/wizard/ModeSelector';
import { useAnalysis } from '../../context/AnalysisContext';
import type { Currency } from '../../types/analysis';
import { useState } from 'react';
import { LocationMap } from "../../components/common/LocationMap";



export function ProjectSetupStep() {
  const { state, updateInput } = useAnalysis();
  const { inputs } = state;
  const [loading, setLoading] = useState(false);

  const [locationInfo, setLocationInfo] = useState({
    street: "",
    city: "",
    district: "",
    state: "",
  });

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

  const fetchLocationDetails = async (lat: number, lon: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
    );

    const data = await response.json();

    setLocationInfo({
      street:
        data.address.road ||
        data.address.suburb ||
        data.address.village ||
        "",
      city:
        data.address.city ||
        data.address.town ||
        data.address.village ||
        "",
      district:
        data.address.county ||
        data.address.state_district ||
        "",
      state: data.address.state || "",
    });
  } catch (err) {
    console.error(err);
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
        </div>
      </Card>
      <Card title="⚡ System Mode">
        <ModeSelector />
      </Card>
    </div>
  );
}
