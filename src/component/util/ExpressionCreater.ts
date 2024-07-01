interface Condition {
  field: string;
  operator: string;
  value: any;
}

interface RequestBody {
  conditions: Condition[];
  limit?: string | number;
  offset?: string | number;
  sort?: 'asc' | 'desc';
  indexName?: string;
  consistent?: boolean;
}

interface ExpressionResult {
  keyConditionExp: string;
  filterConditionExp: string | null;
  expNames: { [key: string]: string };
  expValues: { [key: string]: any };
}

type OperatorHandler = (params: {
  expKey: string;
  operator: string;
  expValue: string;
  keyConditionParts: string[];
  filterConditionParts: string[];
}) => void;

// 處理比較運算符
const handleComparisonOperators: OperatorHandler = ({
  expKey,
  operator,
  expValue,
  keyConditionParts,
}) => {
  keyConditionParts.push(`${expKey} ${operator} ${expValue}`);
};

// 運算符處理程序映射
const operatorHandlers: { [key: string]: OperatorHandler } = {
  '=': handleComparisonOperators,
  '<': handleComparisonOperators,
  '<=': handleComparisonOperators,
  '>': handleComparisonOperators,
  '>=': handleComparisonOperators,
};

export const createExpression = (requestBody: RequestBody): ExpressionResult => {
  const keyConditionParts: string[] = [];
  const filterConditionParts: string[] = [];
  const expNames: { [key: string]: string } = {};
  const expValues: { [key: string]: any } = {};

  requestBody.conditions.forEach((condition, index) => {
    const { field, operator, value } = condition;
    const expKey = `#field${index}`;
    const expValue = `:value${index}`;

    const handler = operatorHandlers[operator.toUpperCase()];
    if (!handler) {
      throw new Error(`Unsupported operator: ${operator}`);
    }

    handler({
      expKey,
      operator: operator.toUpperCase(),
      expValue,
      keyConditionParts,
      filterConditionParts,
    });

    expNames[expKey] = field;
    expValues[expValue] = value;
  });

  return {
    keyConditionExp: keyConditionParts.join(' AND '),
    filterConditionExp:
      filterConditionParts.length > 0 ? filterConditionParts.join(' AND ') : null,
    expNames,
    expValues,
  };
};
