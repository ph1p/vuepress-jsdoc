import React, { FunctionComponent } from 'react';
import styled from 'styled-components/native';

/**
 * This is the ButtonTextWrapper
 */
const ButtonTextWrapper = styled.View`
  height: 40px;
  width: 300px;
`;

/**
 * Props interface
 */
interface Props {
  text: string;
}

/**
 * Test
 * @param props
 */
const Button: FunctionComponent<Props> = props => {
  return <ButtonTextWrapper>{props.text}</ButtonTextWrapper>;
};

export default Icon;
