const SelectOptions = ({
  type,
  text,
  availableDevices,
  selectedDevice,
  onChange,
}) => {
  const toOptions = (mediaDevice) => {
    return (
      <option key={mediaDevice.deviceId} value={mediaDevice.label}>
        {mediaDevice.label}
      </option>
    );
  };

  const handleSelectedMediaDevicesChange = (e) => {
    const selectedMediaDevice = {
      kind: e.target.id,
      label: e.target.value,
    };
    onChange(selectedMediaDevice);
  };

  return (
    <div>
      <label htmlFor={type}>{text}</label>
      <select
        id={type}
        value={selectedDevice}
        onChange={handleSelectedMediaDevicesChange}
      >
        {availableDevices.map(toOptions)}
      </select>
    </div>
  );
};

export default SelectOptions;