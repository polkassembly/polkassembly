import React from "react";
import { Button, Modal, Slider } from "antd";
import { poppins } from 'pages/_app';
import styled from "styled-components"
import { CheckOutlined } from '@ant-design/icons';
import CloseIcon from 'public/assets/icons/sentiment-close.svg';
import AgainstIcon from '~assets/icons/against.svg';
import SlightlyAgainstIcon from '~assets/icons/slightly-against.svg';
import NeutralIcon from '~assets/icons/neutral.svg';
import SlightlyForIcon from '~assets/icons/slightly-for.svg';
import ForIcon from '~assets/icons/for.svg';

interface Props{
  setIsPost:(pre:boolean)=>void;
  openModal:boolean;
  setModalOpen:(pre:boolean)=>void;
  setIsSentimentPost:(pre:boolean)=>void;
  className?:string;
  setSentiment:(pre:number)=>void;
  sentiment:number;
}

const CommentSentimentModal=({setIsPost,openModal,setModalOpen,setIsSentimentPost,className,sentiment,setSentiment}:Props)=>{

  const handleOnChange=(value:number)=>{
    setSentiment(value);
  }

const handleClick=()=>{
setIsSentimentPost(true);
setIsPost(true);
setModalOpen(false);
}
const handleSentimentText=()=>{
switch (sentiment){
  case 1:return 'Completely Against';
  case 2:return 'Slightly Against';
  case 3:return 'Neutral';
  case 4:return 'Slightly For';
  case 5:return 'Completely For' ;
  default:return 'Neutral'
}
}

return (<Modal
       open={openModal}
       wrapClassName={className}
      className={`${poppins.variable} ${poppins.className} max-w-full shrink-0 w-[433px] max-sm:w-[100%] padding  justify-center center-aligned`}
			onCancel={() => {
        setModalOpen(false);
        setIsPost(true);
        setIsSentimentPost(false);
    }}
    centered
    footer={[
   <div className='flex items-center justify-center'>
							<Button onClick={handleClick} className='bg-green-400 border-green-400 text-white font-medium flex items-center t-xs'>
								 Done<CheckOutlined />
							</Button>
						</div>]} 
			closeIcon={<CloseIcon/>}
			zIndex={1002}
><div className='pl-5 pr-5 text-base font-medium justify-center center-aligned flex flex-col items-center'>
  <h5>Thank you for commenting on the post.
    Move the slider to add your sentiment.</h5>
        <Slider
          style={{width:'100%'}}
          className='w-full text-[12px] mt-[32px]'
          trackStyle={{backgroundColor:'#5C74FC'}}
          onChange={(value:number)=>handleOnChange(value)}
          step={5}
          marks={{
          1:{style:{marginTop:'-28px',color:'#334D6E'},label:sentiment===1 ? <AgainstIcon  className='scale-75'/>:<div></div>},
          2:{style:{marginTop:'-28px',color:'#334D6E'},label:sentiment===2 ? <SlightlyAgainstIcon  className='scale-75'/>:<div></div>},
          3:{style:{marginTop:'-28px',color:'#334D6E'},label:sentiment===3 ? <NeutralIcon  className='scale-75'/>:<div></div>},
          4:{style:{marginTop:'-28px',color:'#334D6E'},label:sentiment===4 ? <SlightlyForIcon  className='scale-75'/>:<div></div>},
          5:{style:{marginTop:'-28px',color:'#334D6E'},label:sentiment===5 ? <ForIcon className='scale-75'/>:<div></div>}}}
          min={1}
          max={5}
          defaultValue={3}
    />
    <h5 className='text-sm font-medium text-blue-600 mb-[16px]'>{handleSentimentText()}</h5>
    </div>
</Modal>)
}
export default styled(CommentSentimentModal)`
.padding .ant-modal-content{
  border-radius:4px !important;
  padding:40px 47px !important;
  text-align:center;
  justify-content:center;
  color:#334D6E !important;
}
.padding .ant-slider-dot{
  border-color:#FCE5F2 !important;
}
.padding .ant-slider-dot-active{
  border-color:#5C74FC !important;
}


.padding .ant-tooltip-open{
 border-color:#5C74FC !important;
}
.padding .ant-slider-handle{
  border:1px solid #5C74FC ;
  background:#5C74FC;
}
.padding .ant-slider .ant-slider-rail{
  background-color:#FCE5F2;
}

`;