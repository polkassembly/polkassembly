import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const useGetFilterInUrl=()=>{

  const [tags, setTags] = useState<string[]>([]);
  const router = useRouter();

  useEffect(()=>{
    if(router.query.filterBy){
      const filterBy=router.query.filterBy;
      setTags(JSON.parse(decodeURIComponent(String(filterBy))) || []);
    }else{
      setTags([]);
    }
  }, [])
 return tags;
}

export default useGetFilterInUrl;