import { useMsal } from '@azure/msal-react'
import React, { useEffect } from 'react'

function Error() {
    const {instance} = useMsal();

    useEffect(() => {
        setTimeout(() => {
            test()
        }, 100)
    }, [])

    const test = async () => {
        await instance.logoutPopup()
        window.location.href = import.meta.env.VITE_DEV_AUTHORITY_LOGIN
    }
  return (
    <div>Error</div>
  )
}

export default Error