import {useLocalSearchParams} from 'expo-router';
import {ThemeModeContext} from '../constants/theme';
import {OnboardingFrame} from '../components/onboarding-frame';
import {ProfileProgress,ProfileChoices} from '../components/profile-fields';
import {Input} from '../components/ui';
import {DetailButton} from '../components/post-detail-ui';
import {VerificationStatusCard} from '../components/verification-status-card';
export default function OnboardingPreview(){const {screen,mode}=useLocalSearchParams<{screen?:string;mode?:string}>();return <ThemeModeContext.Provider value={mode==='dark'?'dark':'light'}>{screen==='verification'?<OnboardingFrame title="Verification · Preview" subtitle="A few steps to build trust."><VerificationStatusCard status="pending"/><DetailButton secondary label="Refresh status" onPress={()=>{}}/></OnboardingFrame>:<OnboardingFrame title="Your professional background · Preview" subtitle="Tell us about your work." progress={<ProfileProgress step={2}/>} footer={<><DetailButton label="Save and continue" onPress={()=>{}}/><DetailButton secondary label="Back" onPress={()=>{}}/></>}><Input label="Role" value="Product designer"/><Input label="Organization" placeholder="Your organization" error="Please add your organization or choose independent."/><Input label="Industry" value="Technology"/><ProfileChoices label="Experience level" values={['Early career','Mid-career','Experienced']} value="Mid-career" onChange={()=>{}}/></OnboardingFrame>}</ThemeModeContext.Provider>}
