import React, { useContext } from 'react'
import { AuthContext } from '../Context/AuthContext'
import { Navigate } from 'react-router-dom'

export const ProtecterRouter = ({children}) => {
	const {user} =useContext(AuthContext)
  
	if(!user){
		return <Navigate to="/login" replace />
	}
	return children
}

export const PublicRouter = ({children}) => {
	const {user} =useContext(AuthContext)
  
	if(user){
		return <Navigate to="/" replace />
	}
	return children
}
