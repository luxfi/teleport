import styled from 'styled-components'

export const ModalInfo = styled.div`
  align-items: center;
  padding: 1rem 1rem;
  margin: 0.25rem 0.5rem;
  justify-content: center;
  flex: 1;
  user-select: none;
`

export const TextDot = styled.div`
  height: 3px;
  width: 3px;
  border-radius: 50%;
`

export const FadedSpan = styled.div`
  font-size: 14px;
`
export const Checkbox = styled.input`
  height: 20px;
  margin: 0;
`

export const PaddedColumn = styled.div`
  padding: 20px;
`

export const MenuItem = styled.div`
  padding: 4px 20px;
  height: 56px;
  display: grid;
  grid-template-columns: auto minmax(auto, 1fr) auto minmax(0, 72px);
  grid-gap: 16px;
`

export const SearchInput = styled.input`
  position: relative;
  display: flex;
  padding: 16px;
  align-items: center;
  width: 100%;
  white-space: nowrap;
  background: none;
  border: none;
  outline: none;
  border-radius: 10px;
  -webkit-appearance: none;

  font-size: 18px;

  transition: border 100ms;
  :focus {
    outline: none;
  }
`
export const Separator = styled.div`
  width: 100%;
  height: 1px;
`

export const SeparatorDark = styled.div`
  width: 100%;
  height: 1px;
`
