import React, { useCallback, useState } from 'react'
import {
  BottomSheet,
  Button,
  Input,
  InputProps,
  ListItem,
  useTheme,
} from '@rneui/themed'
import { StyleProp, TextStyle } from 'react-native'

interface Props extends InputProps {
  items: SelectInputItem[]
  value: SelectInputItem
  titleStyle: StyleProp<TextStyle>
  onSelectChange: (item: SelectInputItem) => void
}
export interface SelectInputItem {
  title: string
  description?: string | undefined
  value?: string | undefined
}
export const SelectInput = ({
  items,
  titleStyle,
  value,
  onSelectChange,
  ...rest
}: Props) => {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SelectInputItem>(
    value || items?.[0],
  )
  const { theme } = useTheme()

  const onSelect = useCallback(
    (item: SelectInputItem) => {
      setIsVisible(false)
      setSelectedItem(item)
      onSelectChange?.(item)
    },
    [onSelectChange],
  )
  return (
    <>
      <Input
        {...rest}
        inputContainerStyle={{
          paddingRight: 20,
        }}
        InputComponent={() => (
          <Button
            title={selectedItem?.title}
            containerStyle={{
              backgroundColor: 'transparet',
              width: '100%',
              marginRight: 30,
            }}
            raised={false}
            buttonStyle={[
              {
                backgroundColor: 'transparent',
                width: '100%',
                justifyContent: 'flex-start',
              },
            ]}
            titleStyle={[
              theme.mode === 'light'
                ? {
                    color: theme.colors.black,
                  }
                : {},
              titleStyle,
            ]}
            onPress={() => setIsVisible(true)}
          />
        )}
      />
      <BottomSheet
        isVisible={isVisible}
        modalProps={{
          animationType: 'fade',
        }}
        onBackdropPress={() => setIsVisible(false)}
      >
        {items.map((item, index) => {
          return (
            <ListItem
              key={index}
              bottomDivider={index != items?.length - 1}
              onPress={() => onSelect(item)}
              android_ripple={{
                color: theme.colors.greyOutline,
                foreground: true,
              }}
            >
              <ListItem.Content>
                <ListItem.Title style={{ fontSize: 20 }}>
                  {item?.title}
                </ListItem.Title>
                {item?.description && (
                  <ListItem.Subtitle>{item?.description}</ListItem.Subtitle>
                )}
              </ListItem.Content>
            </ListItem>
          )
        })}
      </BottomSheet>
    </>
  )
}
