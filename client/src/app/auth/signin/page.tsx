import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import ColorModeSelect from '@/shared/theme/ColorModeSelect';
import { LogoIcon } from '@/shared/theme/components/CustomIcons';
import { Card, PageContainer } from '@/shared/theme/styles/Surfaces';
import styles from "@/app/page.module.css";
import classNames from "classnames";
import SignInForm from './SignInForm';

export default function SignIn() {
    return (
        <div className={classNames(styles.page, styles.vcenter, styles.hcenter)}>
            <main className={styles.main}>
                <CssBaseline enableColorScheme />
                <PageContainer direction="column" justifyContent="center" alignContent="center">
                    <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
                    <Card variant="outlined">
                        <LogoIcon />
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
                        >
                            Sign in
                        </Typography>
                        <SignInForm />
                    </Card>
                </PageContainer>
            </main>
        </div>
    );
}
