import { WorkbookJSON } from "../types/Workbook";
import { find, compact, trim } from "lodash";
import { FieldMapType } from "../WorkbookColumnMapping";

/**
 * This is currently a pretty simple function but in the future you will be able to select the
 * sheet to get the headers from. For now this will simply just retrieve the first row with
 * content.
 *
 * @param spreadsheetData Whole spreadsheet data to retrieve the headers from.
 * @param sheetNumber the sheet index (starting from 0) to pull the header columns from.
 * @return An array of the columns from the spreadsheet. Null if no headers could be found.
 */
export function getColumnHeaders(
  spreadsheetData: WorkbookJSON,
  sheetNumber: number
) {
  const data = spreadsheetData?.[sheetNumber]?.find(
    (rowData) => rowData.content.length !== 0
  );
  return (
    data?.content ?? null
  );
}


export function _toPlainString(value: string) {
  if (!!value) {
    return value.replace(/\s|-|_/g, "").toLowerCase();
  } else {
    return value;
  }
}

/**
 * find the possible field that match the column header
 * @param columnHeader The column header from excel file
 * @param fieldOptions FieldOptions that predefined in FieldMappingConfig.json
 * @returns 
 */
export function findMatchField(
  columnHeader: string,
  fieldOptions: {
    label: string;
    value: string;
  }[]
) {
  const option = find(
    fieldOptions,
    (item) => _toPlainString(item.label) === _toPlainString(columnHeader)
  );
  return option;
}

/**
 * Get the data of
 * 
 * @param spreadsheetData Whole spreadsheet data to retrieve the headers from.
 * @param sheetNumber the sheet index (starting from 0) to pull the header columns from.
 * @param fieldNames 
 * @returns 
 */
export function getDataFromWorkbook(
  spreadsheetData: WorkbookJSON,
  sheetNumber: number,
  fieldNames: (string|undefined)[]
) {
  const data:{[key: string]: any}[] = [];
  const workbookData = spreadsheetData?.[sheetNumber].filter(rowData => rowData.content.length != 0);
  for(let i = 1; i < workbookData.length; i++) {
    const row = workbookData[i];
    const rowData: {[key: string]: any} = {};
    for(const index in fieldNames) {
      const field = fieldNames[index];
      if (field !== undefined) {
        rowData[field] = row.content[index];
      }
    };
    data.push(rowData);
  }
  return data;
}

/**
 * Check is a string a number value
 * @param value string 
 * @returns number
 */
export function isNumber(value: string|null|undefined): boolean {
  const num = convertNumber(value);
  return typeof num === "number" && !isNaN(num);
}

/**
 * Check if a comma separated string a number array
 * @param value 
 * @returns 
 */
export function isNumberArray(value: string|null|undefined): boolean {
  if(!!value) {
    for (const val of value.split(",")) {
      if (isNumber(val)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Check if a comma separated string a boolean value.  
 * @param value String, it can be 'true', 'false', 'yes', or 'no'
 * @returns boolean
 */
export function isBoolean(value: string): boolean {
  const regx = /^\s*yes|no|true|false\s*$/ig
  return !!value && regx.test(value);
}

/**
 * Check is a comma separated string a boolean array
 * @param value string.  It can be 'true, false, No, yes'
 * @returns 
 */
export function isBooleanArray(value: string): boolean {
  const regx = /^\s*(yes|no|true|false)\s*(,\s*(yes|no|true|false)\s*)*$/ig;
  return !!value && regx.test(value);
}

/**
 * Check is a string a map paris
 * @param value string, it can be 'key:value, key2:"value with special char", key3 : value3' 
 * @returns boolean
 */
export function isMap(value: string): boolean {
  const regx = /^\s*([0-9A-Za-z_]+\s*:\s*(".*"|[0-9A-Za-z_]+))\s*(,\s*([0-9A-Za-z_]+\s*:\s*(".*"|[0-9A-Za-z_]+)))*\s*$/g;
  return !!value && regx.test(value);
}

/**
 * convert a string to number
 * @param value string
 * @returns number
 */
export function convertNumber(value: any): number | null {
  if (value !== null && value !== undefined) {
    return +value;
  } else {
    return null;
  }
}

/**
 * convert string to a boolean value
 * @param value string, it can be 'true', 'false', 'yes', or 'no'
 * @returns boolean
 */
export function convertBoolean(value: any): boolean {
  const strBoolean = String(value).toLowerCase().trim();
  if (strBoolean === "false" || strBoolean === "no") {
    return false;
  }
  return !!value;
}

/**
 * Convert comma separated string into array of strings.
 *
 * If a value contains a comman, please wrap the value with double quote.
 *
 * @param value Comma separated string, e.g.  `asdb,deeasdf,sdf,"sdf,sadf" , sdfd`
 *
 */
export function convertStringArray(value: string): string[] {
  const arr = value.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);
  return arr.map((str) => trim(trim(str, '"')));
}



/**
 * Convert comma separated number string into array of numbers.
 *
 * @param value comma separated number string, e.g. "111,222,333,444"
 * Any items that are not number will be filter out.
 */
export function convertNumberArray(value: string): number[] {
  const arr = value.split(",");
  return arr
    .map((item) => trim(item))
    .filter((item) => item !== "")
    .map((item) => convertNumber(item.trim()))
    .filter((item) => typeof item === "number" && !isNaN(item)) as number[];
}

/**
 * convert comma separated boolean string into array of boolean
 * @param value 
 */
export function convertBooleanArray(value: string): boolean[] {
  const arr = value.split(",");
  return arr
    .map((item) => trim(item))
    .filter((item) => item !== "")
    .map((item) => convertBoolean(item.trim())) as boolean[];
}
 
/**
 * convert string into a map
 * @param value Map type of string.
 *
 * Here is an example of the data:
 * "key1:value1, key2:value2, key3: value3"
 *
 * If a value contains a comman (,) or a colon (:), please wrap the value with double quote. For example:
 * 'key1: "abc,def:123", key2: value2'
 *
 * Any item in the value string has no key or value will be filtered out.
 *
 */
export function convertMap(value: string): { [key: string]: any } {
  const regx = /:(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
  const items = value
    .split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/)
    .map((str) => trim(str));
  const map = {} as { [key: string]: any };
  for (const keyValue of items) {
    if (keyValue) {
      const arr = keyValue.split(regx).map((str) => trim(trim(str, '"')));
      if (arr && arr.length === 2 && arr[0] !== "" && arr[1] !== "") {
        const key = arr[0];
        const strVal = arr[1];
        if (isBoolean(strVal)) {
          map[key] = convertBoolean(strVal);
        } else if (isNumber(strVal)) {
          map[key] = convertNumber(strVal);
        } else {
          map[key] = strVal;
        }
      }
    }
  }
  return map;
}