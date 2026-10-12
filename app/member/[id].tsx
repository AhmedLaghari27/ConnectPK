import {useLocalSearchParams} from 'expo-router';
import {MemberProfileScreen} from '../../components/member-profile-screen';
export default function PublicProfile(){const {id}=useLocalSearchParams<{id:string}>();return <MemberProfileScreen key={String(id)} memberId={typeof id==='string'?id:''}/>;}
