import { useEffect, useState } from 'react';
import { Card } from '../../components/common/Card';
import { FormField } from '../../components/common/FormField';
import { LocationMap } from '../../components/common/LocationMap';
import { ModeSelector } from '../../components/wizard/ModeSelector';
import { useAnalysis } from '../../context/AnalysisContext';
import InfoDrawer from "../../components/common/InfoDrawer";

export function ProjectSetupStep() {
  const { state, updateInput } = useAnalysis();
  const { inputs } = state;
  const [locationInfo, setLocationInfo] = useState({
    street: '',
    block: '',
    district: '',
    state: '',
  });
  
  const [searchText, setSearchText] = useState<string>('');
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const fetchPSH = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${lon}&latitude=${lat}&format=JSON`);
      const data = await response.json();
      const psh = data.properties.parameter.ALLSKY_SFC_SW_DWN.ANN;
      updateInput('psh', psh);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLocationDetails = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
      const data = await response.json();
      const address = data.address || {};
      setLocationInfo({
        street: address.road || address.suburb || address.neighbourhood || address.village || '',
        block: address.block || address.city_block || address.quarter || address.hamlet || '',
        district: address.county || address.state_district || address.district || '',
        state: address.state || '',
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    void fetchLocationDetails(inputs.latitude, inputs.longitude);
  }, []);

  const updateCoordinates = async (lat: number, lon: number) => {
    updateInput('latitude', lat);
    updateInput('longitude', lon);
    await fetchPSH(lat, lon);
    await fetchLocationDetails(lat, lon);
  };

  useEffect(() => {
    if (!searchText.trim()) {
      setSearchResult([]);
      return;
    }

    if (searchText === inputs.locationName) {
      setSearchResult([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);

        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(searchText)}&limit=5`);

        const data = await res.json();

        setSearchResult(data.features || []);
      } catch (error) {
        console.error(error);
        setSearchResult([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText]);
  

  return (
    <div className="step-panel visible">
      <div className="panel-title">
        Project Setup <span>Step 1</span>
      </div>
      <div className="panel-sub">Location, system mode and financial parameters</div>
      <Card title="Location & Project">
        <div className="form-grid">
          <FormField
           label='Project Name'
           value={inputs.projectName}
           onChange={(value) => updateInput('projectName', String(value))}
          />
          <div className='form-group' style={{position: 'relative', width: '100%'}}>
            <label>Location Name</label>
            <input 
              type="text"
              value={searchText}
              placeholder='Enter a location'
              onChange={(e) => setSearchText(e.target.value)}
            />

            {isSearching 
            ? <div style={{
              marginTop: 6,
              fontSize: 12
            }}>
              Searching...
            </div>
            : null }

            { searchResult.length > 0 ? (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  zIndex: 50,
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  animation: 'fadeIn 180ms ease-out',
                }}
              >
                { searchResult.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      const placeName = item.properties.name || `${item.geometry.coordinates[1]}, ${item.geometry.coordinates[0]}`;
                      const lon = item.geometry.coordinates[0];
                      const lat = item.geometry.coordinates[1];

                      setSearchText(placeName);
                      setIsSearching(false);
                      updateInput('locationName', placeName);
                      setSearchResult([]);

                      void updateCoordinates(lat, lon);
                    }}
                    style={{
                      padding: '8px 10px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f3f4f6'
                    }}
                  >
                    {item.properties.name}, {item.properties.city ? item.properties.city+' ,' : ''} {item.properties.state ? item.properties.state+' ,' : ''} {item.properties.country ? item.properties.country : ''}
                  </div>
                )) }
              </div>
            ) :  null}
          </div>
          <FormField
            label="Coordinates (Lat, Lon)"
            value={`${inputs.latitude}, ${inputs.longitude}`}
            onChange={(value) => {
              const coords = String(value).split(',');
              const lat = Number(coords[0].trim());
              const lon = Number(coords[1].trim());

              if(!Number.isFinite(lat) || !Number.isFinite(lon)) return;
              if (coords.length === 2) void updateCoordinates(lat, lon);
            }}
            placeholder="28.6139, 77.2090"
          />
        </div>
        <div className="mt-6">
          <LocationMap latitude={inputs.latitude} longitude={inputs.longitude} onLocationChange={updateCoordinates} locationName={inputs.locationName} />
        </div>
        <div className="detail-block mt-6">
          {locationInfo.street ? <div><strong>Street / Locality:</strong> {locationInfo.street}</div> : null}
          {locationInfo.block ? <div><strong>Block:</strong> {locationInfo.block}</div> : null}
          {locationInfo.district ? <div><strong>District:</strong> {locationInfo.district}</div> : null}
          {locationInfo.state ? <div><strong>State:</strong> {locationInfo.state}</div> : null}
          <div><strong>Latitude:</strong> {inputs.latitude.toFixed(6)}</div>
          <div><strong>Longitude:</strong> {inputs.longitude.toFixed(6)}</div>
        </div>
      </Card>
      <Card title="System Mode">
        <ModeSelector />
      </Card>
    </div>
  );
}
