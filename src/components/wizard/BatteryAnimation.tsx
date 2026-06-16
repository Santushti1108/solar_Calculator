export function BatteryAnimation() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
      <div className="batt-anim">
        <div className="batt-top" />
        <div className="batt-body">
          <div className="batt-fill" />
        </div>
      </div>
    </div>
  );
}
