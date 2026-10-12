import {DetailButton as Button} from '../components/post-detail-ui';
import { useState, type ComponentProps } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { OnboardingFrame } from '../components/onboarding-frame';
import { Card } from '../components/ui';
import { useTheme } from '../constants/theme';
const welcomeRules = [
 'Professional connections only. No dating, harassment, scams, or repeated selling.',
 'Use your real name. Only approved members can post, comment, or offer help.',
 'Private chat opens after a post owner accepts an offer. You can report or block anyone.',
 'Protect private information. Never send money to unverified people; meet in public.',
];

const slides:{title:string;body:string;icon:ComponentProps<typeof Ionicons>['name']}[]=[
 {title:'Share what you’re building.',body:'A project, a career step, or an idea. Bring your professional journey to ConnectPK.',icon:'construct-outline'},
 {title:'Get a fresh perspective.',body:'Ask a question and exchange useful opinions with professionals across Pakistan.',icon:'chatbubbles-outline'},
 {title:'Turn an offer into a conversation.',body:'Receive offers of help. Accept an offer when you’re ready to open a private chat.',icon:'hand-left-outline'},
];
export default function WelcomeScreen(){
 const t=useTheme();const [slide,setSlide]=useState(0);const current=slides[slide];
 return <OnboardingFrame title="Where professionals build together" subtitle="Karachi · Lahore · Islamabad">
  <Card style={{padding:t.spacing.md,gap:t.spacing.md}}>
   <View style={{width:t.avatar.hero,height:t.avatar.hero,borderRadius:t.radius.lg,backgroundColor:t.colors.primarySoft,alignItems:'center',justifyContent:'center'}}><Ionicons name={current.icon} size={t.avatar.medium} color={t.colors.primary}/></View>
   <View accessibilityLiveRegion="polite" style={{gap:t.spacing.sm}}><Text accessibilityRole="header" style={[t.typography.heading,{color:t.colors.text}]}>{current.title}</Text><Text style={[t.typography.body,{color:t.colors.textSecondary}]}>{current.body}</Text></View>
   <View accessibilityLabel={`Slide ${slide+1} of 3`} style={{flexDirection:'row',gap:t.spacing.sm}}>{slides.map((item,index)=><View key={item.title} style={{height:t.spacing.sm,width:index===slide?t.spacing.lg:t.spacing.sm,borderRadius:t.radius.pill,backgroundColor:index===slide?t.colors.primary:t.colors.border}}/>)}</View>
  </Card>
  {slide===2?<Button label="Get started" onPress={()=>router.push('/email')}/>:<Button label="Next" onPress={()=>setSlide(value=>value+1)}/>}
  {slide>0?<Button label="Back" secondary onPress={()=>setSlide(value=>value-1)}/>:null}
  <Text style={[t.typography.caption,{color:t.colors.textSecondary,textAlign:'center'}]}>Free for approved members · Adults 18+</Text>
  {slide===2?<Card><Text style={[t.typography.label,{color:t.colors.text}]}>A professional space built on respect</Text>{welcomeRules.map(rule=><Text key={rule} style={[t.typography.body,{color:t.colors.textSecondary}]}>• {rule}</Text>)}</Card>:null}
 </OnboardingFrame>;
}
