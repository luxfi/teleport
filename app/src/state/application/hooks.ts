import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../store'
import { ApplicationModal, setOpenModal } from './actions'
import useActiveWeb3React from 'hooks/useActiveWeb3React'

export function useBlockNumber(): number | undefined {
  const { chainId } = useActiveWeb3React()

  return useSelector((state: AppState) => state.application.blockNumber ? state.application.blockNumber[chainId ?? -1] : null)
}

export function useModalOpen(modal: ApplicationModal): boolean {
  const openModal = useSelector((state: AppState) => state.application.openModal)
  return openModal === modal
}

export function useToggleModal(modal: ApplicationModal): () => void {
  const open = useModalOpen(modal)
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(open ? null : modal)), [dispatch, modal, open])
}

export function useOpenModal(modal: ApplicationModal): () => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(modal)), [dispatch, modal])
}

export function useCloseModals(): () => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(null)), [dispatch])
}

export function useConnectModalToggle(): () => void {
  return useToggleModal(ApplicationModal.CONNECT)
}
export function useWalletModalToggle(): () => void {
  return useToggleModal(ApplicationModal.WALLET)
}
export function useNetworkModalToggle(): () => void {
  return useToggleModal(ApplicationModal.NETWORK)
}

export function useWalletSidebarToggle(): () => void {
  return useToggleModal(ApplicationModal.SIDEBAR)
}
export function useMintModalToggle(): () => void {
  return useToggleModal(ApplicationModal.MINT)
}