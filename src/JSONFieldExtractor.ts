export const JSONFieldExtractor = function(data: any) {
    const _data = data;

    this.extractFields = (desiredFields: any) => {
        return _internalExtractFields(desiredFields, _data);
    };

    this.getData = () => {
        return _data;
    };

    function _internalExtractFields(desiredFields: any, input: any) {
        const output:any = {};

        for(const key in desiredFields) {
            const value = desiredFields[key];
            if(value == null) {
                output[key] = input[key];
            } else {
                output[key] = _internalExtractFields(value, input[key]);
            }
        }
        return output;
    }

    function hasSubObject(o: any) {
        for(var key in o) {
            if(o.hasOwnProperty(key)) {
                const value = o[key];
                if(typeof value != "string") {
                    return true;
                }
            }
        }
        return false;
    }

    this.keyTreeString = () => {
        return _keyTreeStringRecursive(_data,0);
    };

    function _keyTreeStringRecursive(input: any, indent: any) {
        let output = "";
        const indentStr = "    ";
        for(const key in input) {
            const value = input[key];
            if(!hasSubObject(value)) {
                output += (indentStr.repeat(indent)) + key + "\n";
            } else {
                output += _keyTreeStringRecursive(value, indent+1);
            }
        }
        return output;
    }



    return this;
};