import Menubar from '@/components/menu'

export default function Menu({ params, children }) {
  const { map } = params
  return (
    <>
      <Menubar path={`/${map}`} map={map} />
      {children}
    </>
  )
}
