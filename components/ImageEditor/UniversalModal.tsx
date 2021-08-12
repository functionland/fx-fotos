import React from "react";
import { Modal as RNModal, Platform } from "react-native";
//@ts-ignore
import WebModal from "modal-enhanced-react-native-web";

interface IUniversalModalProps extends React.ComponentProps<typeof RNModal> {
  children: React.ReactNode;
}

export const UniversalModal = (props: IUniversalModalProps) => {
  if (Platform.OS === "web") {
    return (
      <RNModal visible={props.visible} style={{ margin: 0 }}>
        {props.children}
      </RNModal>
    );
  }

  return <RNModal {...props} />;
};
