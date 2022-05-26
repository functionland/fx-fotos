/**
 * Example Button Component to demonstrate component library
 */

import React from "react";
import {Button, ButtonProps} from 'react-native';

const FxButton: React.FC<ButtonProps> = (props) => <Button {...props} />;

export { FxButton };
