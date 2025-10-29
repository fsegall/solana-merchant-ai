import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { PasskeyOnboarding } from '@/components/PasskeyOnboarding';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/lib/i18n';

export default function Auth() {
  const { t } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
            // Detecta se usuário já está registrado
            if (error.message?.includes('already registered') || error.status === 422) {
              toast.error(t('auth.alreadyRegistered'));
              setIsSignUp(false);
            } else {
              toast.error(error.message);
            }
          } else {
            toast.success(t('auth.accountCreated'));
            setIsSignUp(false);
          }
        } else {
          const { error } = await signIn(email, password);
          if (error) {
            console.error('Erro de login:', error);
            toast.error(error.message || t('auth.loginError'));
          } else {
            console.log('Login bem-sucedido, redirecionando...');
            toast.success(t('auth.loginSuccess'));
          // Pequeno delay para garantir que o estado foi atualizado
          setTimeout(() => {
            navigate('/');
          }, 100);
        }
      }
    } catch (error) {
      console.error('Erro no handleSubmit:', error);
      toast.error(t('auth.requestError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">{t('auth.title')}</h1>
          <p className="text-muted-foreground">{t('auth.subtitle')}</p>
        </div>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="passkey">
              {t('auth.passkey')} (Beta)
            </TabsTrigger>
            <TabsTrigger value="email">
              {t('auth.email')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="passkey">
            <Card className="mb-4 border-orange-500/50 bg-orange-500/10">
              <CardContent className="pt-6">
                <p className="text-sm text-center text-orange-600 dark:text-orange-400">
                  ⚠️ Passkeys are in beta and not fully tested. Please use email & password for demo.
                </p>
              </CardContent>
            </Card>
            <PasskeyOnboarding />
          </TabsContent>

          <TabsContent value="email">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>{isSignUp ? t('auth.createAccount') : t('auth.login')}</CardTitle>
                <CardDescription>
                  {isSignUp ? t('auth.createAccountDesc') : t('auth.loginDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder={t('auth.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder={t('auth.passwordPlaceholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t('auth.processing') : isSignUp ? t('auth.createAccountButton') : t('auth.loginButton')}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.noAccount')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
