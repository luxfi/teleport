import { AbstractConnector } from "@web3-react/abstract-connector";
import { FC } from "react";
import { SvgProps } from "../components/Svg";
import { ConnectorNames } from "../constants/types";

export interface Config {
    title: string
    icon: FC<SvgProps>
    connectorId: ConnectorNames
    connector: AbstractConnector
    color: string
  }
  