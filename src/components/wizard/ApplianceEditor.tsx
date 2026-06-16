import { useAnalysis } from '../../context/AnalysisContext';
import { Trash2 } from "lucide-react";

export function ApplianceEditor() {
  const { state, updateAppliance, addAppliance, removeAppliance } = useAnalysis();

  return (
    <>
      <div className="appl-hdr">
        <div className="appl-head-grid">
          <span>Appliance</span>
          <span>Qty</span>
          <span>Watts</span>
          <span>Hrs/Day</span>
          <span>Priority</span>
          <span>kWh/Day</span>
          
          <span />
        </div>
      </div>
      {state.appliances.map((item, index) => (
        <div className="appl-row" key={index}>
          <input value={item.name} onChange={(event) => updateAppliance(index, { name: event.target.value })} />
          <input type="number" value={item.qty} min="1" onChange={(event) => updateAppliance(index, { qty: Number(event.target.value) })} />
          <input type="number" value={item.w} min="1" onChange={(event) => updateAppliance(index, { w: Number(event.target.value) })} />
          
          <input type="number" value={item.hrs} min="0.5" step="0.5" onChange={(event) => updateAppliance(index, { hrs: Number(event.target.value) })} />
          <select
              value={item.priority}
              onChange={(event) =>
                updateAppliance(index, {
                  priority:
                    event.target.value as
                      | "critical"
                      | "non_critical",
                })
              }
            >
              <option value="critical">
                Critical
              </option>
              <option value="non_critical">
                Non-Critical
              </option>
          </select>
          <input value={((item.qty * item.w * item.hrs) / 1000).toFixed(2)} readOnly style={{ opacity: 0.6 }} />
          <button className="del-btn" type="button" onClick={() => removeAppliance(index)}>
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button className="btn-nav back inline-btn" type="button" onClick={addAppliance}>
        + Add Appliance
      </button>
    </>
  );
}
