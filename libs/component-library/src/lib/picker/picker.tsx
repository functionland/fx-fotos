import React, { useMemo } from 'react';
import { RestyleProps } from '../theme';
import { Picker, PickerProps } from '@react-native-picker/picker';
import { useFxRestyle } from '../../hooks/useFxRestyle';

type FxPickerProps = RestyleProps &
  Omit<PickerProps, 'style' | 'itemStyle'> & {
    [Property in keyof RestyleProps as `itemStyle${Capitalize<
      string & Property
    >}`]: RestyleProps[Property];
  };

const FxPicker = ({ children, ...rest }: FxPickerProps) => {
  const { itemStyle: itemStyleProps, ...restProps } = useMemo(
    () =>
      Object.keys(rest).reduce(
        (acc, cur) => {
          if (cur.includes('itemStyle')) {
            const pascalProperty = cur.replace('itemStyle', '');
            const property =
              pascalProperty.charAt(0).toLowerCase() + pascalProperty.slice(1);
            return {
              ...acc,
              itemStyle: {
                [property]: rest[cur as keyof Omit<FxPickerProps, 'children'>],
              },
            };
          }
          return {
            ...acc,
            [cur]: rest[cur as keyof Omit<FxPickerProps, 'children'>],
          };
        },
        { itemStyle: {} } as FxPickerProps & { itemStyle: RestyleProps }
      ),
    [rest]
  );
  const props = useFxRestyle(restProps);
  const { style: itemStyle } = useFxRestyle(itemStyleProps);
  return (
    <Picker {...props} itemStyle={itemStyle}>
      {children}
    </Picker>
  );
};

const FxPickerItem = Picker.Item;

export { FxPicker, FxPickerItem };
