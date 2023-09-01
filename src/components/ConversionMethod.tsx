import { Method } from "./../constants/index";

function ConversionMethod({
  conversionMethod,
  setConversionMethod,
}: {
  conversionMethod: Method;
  setConversionMethod: React.Dispatch<React.SetStateAction<Method>>;
}) {
  return (
    <div className="conversion-method">
      <label>
        Conversion Method:
        <select
          value={conversionMethod}
          onChange={(e) => setConversionMethod(e.target.value as Method)}
        >
          <option value="leftToRight">Left to Right, Top to Bottom</option>
          <option value="topToBottomLeft">Top to Bottom, Left to Right</option>
          <option value="topToBottomRight">Top to Bottom, Right to Left</option>
        </select>
      </label>
    </div>
  );
}

export default ConversionMethod;
