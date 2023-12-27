import { ConversionMethod } from "./../constants/index";

type ConversionMethodProps = {
  conversionMethod: ConversionMethod;
  setConversionMethod: React.Dispatch<React.SetStateAction<ConversionMethod>>;
};

const ConversionMethodSelector = ({
  conversionMethod,
  setConversionMethod,
}: ConversionMethodProps) => {
  return (
    <div className="conversion-method">
      <label>
        Conversion Method:
        <select
          value={conversionMethod}
          onChange={(e) =>
            setConversionMethod(e.target.value as ConversionMethod)
          }
        >
          <option value="leftToRight">Left to Right, Top to Bottom</option>
          <option value="topToBottomLeft">Top to Bottom, Left to Right</option>
          <option value="topToBottomRight">Top to Bottom, Right to Left</option>
        </select>
      </label>
    </div>
  );
};

export default ConversionMethodSelector;
