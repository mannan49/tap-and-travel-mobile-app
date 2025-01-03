import React from 'react'
import TabRoutes from './TabRoutes'
import BookTicket from '../Screens/BookTicket/BookTicket'

export default function (Stack){
    return(
        <>
         <Stack.Screen name="Home" component={TabRoutes} />
         <Stack.Screen name="BookTicket" component={BookTicket} />
    
        </>
    )
}