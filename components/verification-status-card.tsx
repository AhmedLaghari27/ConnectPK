import {Text,View} from 'react-native';
import {Badge,Card} from './ui';
import {useUiStyles} from './onboarding-ui';
import {useTheme} from '../constants/theme';
import {verificationCopy as c} from '../constants/verification-copy';
import type {VerificationStatus} from '../lib/verification';
export function VerificationStatusCard({status}:{status:VerificationStatus}){const t=useTheme();const s=useUiStyles();return <Card><View style={{alignSelf:'flex-start'}}><Badge label={c.status[status]} tone={status==='approved'?'success':status==='rejected'?'error':status==='pending'?'warning':'neutral'}/></View><Text accessibilityRole="header" style={[t.typography.title,{color:t.colors.text}]}>{status==='approved'?'You’re verified.':status==='pending'?'Your submission is in review.':status==='rejected'?'Let’s try again.':'A few steps to build trust.'}</Text><Text style={s.body}>{status==='pending'?'Your evidence has been submitted for private review. Use Refresh status below to check for an update.':status==='approved'?'Your verification is approved. Tap Continue to return to ConnectPK.':status==='rejected'?c.detail.rejected:'Capture a fresh selfie, optionally add professional evidence, and submit for review.'}</Text></Card>;}
