import styled from "styled-components";
import { Collapse as AntDCollapse } from 'antd';
export const Collapse = styled(AntDCollapse)`
@media (max-width: 768px){
    &.ant-collapse-large >.ant-collapse-item >.ant-collapse-header{
        padding:8px 12px;
    }
}
`