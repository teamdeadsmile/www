import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

export function useContent(path, params){
 const [state,setState]=useState({status:'loading',data:[],error:''});
 const load=useCallback(async()=>{
  setState(v=>({...v,status:'loading',error:''}));
  try{const data=await api.get(path,params);setState({status:'success',data:data||[],error:''});}
  catch(err){setState({status:'error',data:[],error:err.message||'Unable to load content.'});}
 },[path,JSON.stringify(params)]);
 useEffect(()=>{load()},[load]);
 return {...state,retry:load};
}
