import type { GraphQLFormattedError } from "graphql";

type Error = {
    message: string,
    statusCode:string
}

const customFetch = async (url:string , options:RequestInit)=>{
  const token = localStorage.getItem('access_token')
  const headers = options.headers as Record<string,string>
  return await fetch(url,{
    ...options,
    headers:{
        ...headers,
       Authorization: headers?.Authorization || `Bearer ${token}`,
      "Content-Type": "application/json",
      "Apollo-Require-Preflight": "true",
    }
  })
}

const getGrarphQLErrors = (body: Record<"errors",GraphQLFormattedError[] | undefined>) : 
Error | null => {
   if(!body){
    return {
        message:"Unknown Error",
        statusCode:"Internal Error"
    }
   }

   if('errors' in body){
    const errors = body.errors
    const messages = errors?.map((err)=>err.message)?.join("")
    const statusCode = errors?.[0]?.extensions?.code
    return {
         message: messages || JSON.stringify(errors)  ,
         statusCode:statusCode
    }
   }

   return null
}


export const fetchWrapper = async(url:string,options:RequestInit)=>{
   const res =await customFetch(url,options)
   const resClone = res.clone()
   const body = await resClone.json()
   const error =  getGrarphQLErrors(body)
   if(error){
    throw error
   }

   return res
}