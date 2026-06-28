// Exact SVG icons lifted from the prototype sidebar (frontend/prototype/*.dc.html).
// Kept 1:1 — do not swap for an icon library.

interface IconProps {
  size?: number
  className?: string
}

export function LogoMark({ size = 19, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.5a9.5 9.5 0 1 0 6.4 16.53l2.1 2.1a1.2 1.2 0 0 0 1.7-1.7l-2.1-2.1A9.5 9.5 0 0 0 12 2.5Zm0 4a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Z" />
    </svg>
  )
}

export function DashboardIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12.0304 5.9513C12.0304 4.88247 11.1352 3.86067 9.90188 4.01565C8.51526 4.18989 7.18259 4.68447 6.01205 5.4666C4.5275 6.45855 3.37044 7.86843 2.68717 9.51797C2.00391 11.1675 1.82514 12.9826 2.17346 14.7338C2.52179 16.4849 3.38156 18.0934 4.64407 19.3559C5.90657 20.6184 7.5151 21.4782 9.26624 21.8265C11.0174 22.1749 12.8325 21.9961 14.482 21.3128C16.1316 20.6296 17.5415 19.4725 18.5334 17.988C19.3155 16.8174 19.8101 15.4847 19.9844 14.0981C20.1393 12.8648 19.1175 11.9696 18.0487 11.9696H13.0335C12.4795 11.9696 12.0304 11.5205 12.0304 10.9665V5.9513Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M15.1536 2.02043C13.8986 1.83992 13 2.88595 13 3.95207V9.89247C13 10.5041 13.4959 11 14.1075 11L20.0479 11C21.1141 11 22.1601 10.1014 21.9796 8.84637C21.8842 8.18302 21.7061 7.53266 21.4485 6.91073C21.0437 5.93348 20.4504 5.04552 19.7024 4.29757C18.9545 3.54962 18.0665 2.9563 17.0893 2.55151C16.4673 2.2939 15.817 2.11585 15.1536 2.02043Z" />
    </svg>
  )
}

export function InboxIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 13.8153 2.48451 15.5196 3.33127 16.9883C3.50372 17.2874 3.5333 17.6516 3.38777 17.9647L2.53406 19.8016C2.00986 20.7933 2.72736 22 3.86159 22H12C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11H11C11.5523 11 12 10.5523 12 10C12 9.44772 11.5523 9 11 9H9ZM9 13C8.44772 13 8 13.4477 8 14C8 14.5523 8.44772 15 9 15H15C15.5523 15 16 14.5523 16 14C16 13.4477 15.5523 13 15 13H9Z" />
    </svg>
  )
}

export function ProductsIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M6.45925 6C4.02505 6 2.1552 8.15595 2.49945 10.5657L3.51965 17.7071C3.87155 20.1704 5.98115 22 8.4694 22H15.531C18.0193 22 20.1289 20.1704 20.4808 17.7071L21.501 10.5657C21.8452 8.15595 19.9754 6 17.5412 6H6.45925Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M9.44722 2.10554C9.9412 2.35253 10.1414 2.9532 9.89444 3.44718L8.10558 7.02489C7.85859 7.51887 7.25792 7.71909 6.76394 7.4721C6.26996 7.22511 6.06974 6.62444 6.31673 6.13046L8.10558 2.55275C8.35257 2.05877 8.95324 1.85855 9.44722 2.10554Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M14.5528 2.10552C15.0468 1.85853 15.6474 2.05876 15.8944 2.55273L17.6833 6.13044C17.9303 6.62442 17.73 7.22509 17.2361 7.47208C16.7421 7.71907 16.1414 7.51885 15.8944 7.02487L14.1056 3.44716C13.8586 2.95318 14.0588 2.35251 14.5528 2.10552Z" />
    </svg>
  )
}

export function ContactsIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M12 13C8.03683 13 5.48769 14.4462 4.13838 16.655C3.30094 18.0259 3.62147 19.4526 4.47764 20.4474C5.29895 21.4018 6.62227 22 7.99999 22H16C17.3777 22 18.701 21.4018 19.5224 20.4474C20.3785 19.4526 20.6991 18.0259 19.8616 16.655C18.5123 14.4462 15.9632 13 12 13Z" />
    </svg>
  )
}

export function AgentsIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="3.3" r="1.5" />
      <rect x="11.25" y="3.6" width="1.5" height="3.2" rx="0.75" />
      <rect x="3.5" y="6.5" width="17" height="13" rx="5" />
      <circle cx="9" cy="13" r="1.75" fill="var(--sidebar)" />
      <circle cx="15" cy="13" r="1.75" fill="var(--sidebar)" />
    </svg>
  )
}

export function IntegrationsIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M3 16L8.96685 16C9.51914 16 9.96685 16.4477 9.96685 17C9.96685 17.5523 9.51914 18 8.96685 18L3 18C2.44772 18 2 17.5523 2 17C2 16.4477 2.44772 16 3 16Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M14 7C14 6.44772 14.4477 6 15 6H21C21.5523 6 22 6.44772 22 7C22 7.55228 21.5523 8 21 8H15C14.4477 8 14 7.55228 14 7Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M2 7C2 6.44772 2.44772 6 3 6H3.01C3.56228 6 4.01 6.44772 4.01 7C4.01 7.55228 3.56228 8 3.01 8H3C2.44772 8 2 7.55228 2 7Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M20 17C20 16.4477 20.4477 16 21 16H21.01C21.5623 16 22.01 16.4477 22.01 17C22.01 17.5523 21.5623 18 21.01 18H21C20.4477 18 20 17.5523 20 17Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M15 13C12.7856 13 11 14.7961 11 17C11 19.2039 12.7856 21 15 21C17.2144 21 19 19.2039 19 17C19 14.7961 17.2144 13 15 13Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M9 3C6.78562 3 5 4.79609 5 7C5 9.20391 6.78562 11 9 11C11.2144 11 13 9.20391 13 7C13 4.79609 11.2144 3 9 3Z" />
    </svg>
  )
}

export function SettingsIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M11.2707 2C9.86736 2 8.7297 3.13766 8.7297 4.54104C8.7297 4.74442 8.58945 5.01577 8.25424 5.19782C8.15109 5.25384 8.04936 5.3121 7.94912 5.37253C7.6148 5.57407 7.30096 5.56113 7.1167 5.4557C5.8929 4.75548 4.3334 5.17333 3.62365 6.39163L2.91923 7.60077C2.20812 8.82141 2.62778 10.3877 3.85393 11.0892C4.0317 11.191 4.19885 11.4497 4.19071 11.8346C4.18955 11.8896 4.18896 11.9448 4.18896 12C4.18896 12.0553 4.18955 12.1104 4.19071 12.1654C4.18955 12.5504 4.03171 12.8091 3.85395 12.9108C2.62781 13.6123 2.20815 15.1786 2.91926 16.3992L3.6237 17.6084C4.33345 18.8267 5.89293 19.2445 7.11673 18.5443C7.30099 18.4389 7.61481 18.4259 7.94912 18.6275C8.04936 18.6879 8.15109 18.7462 8.25424 18.8022C8.58945 18.9842 8.7297 19.2556 8.7297 19.459C8.7297 20.8623 9.86736 22 11.2707 22H12.7294C14.1328 22 15.2704 20.8623 15.2704 19.459C15.2704 19.2556 15.4107 18.9842 15.7459 18.8022C15.849 18.7462 15.9508 18.6879 16.051 18.6275C16.3853 18.4259 16.6991 18.4389 16.8834 18.5443C18.1072 19.2445 19.6667 18.8267 20.3764 17.6084L21.0809 16.3992C21.792 15.1786 21.3723 13.6123 20.1462 12.9108C19.9684 12.8091 19.8013 12.5504 19.8094 12.1654C19.8106 12.1104 19.8112 12.0552 19.8112 12C19.8112 11.9448 19.8106 11.8896 19.8094 11.8346C19.8013 11.4496 19.9684 11.1909 20.1462 11.0892C21.3724 10.3877 21.792 8.8214 21.0809 7.60076L20.3765 6.39162C19.6667 5.17332 18.1072 4.75547 16.8834 5.45569C16.6992 5.56113 16.3853 5.57406 16.051 5.37252C15.9508 5.31209 15.8491 5.25384 15.7459 5.19782C15.4107 5.01577 15.2704 4.74442 15.2704 4.54104C15.2704 3.13766 14.1328 2 12.7294 2H11.2707ZM12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9Z" fill="currentColor" />
    </svg>
  )
}

export function LogoutIcon({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  )
}
