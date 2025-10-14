import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { PasskeyOnboarding } from '@/components/PasskeyOnboarding';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Auth() {
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
            toast.error('Este email já está registrado. Faça login ao invés disso.');
            setIsSignUp(false);
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Conta criada! Faça login para continuar.');
          setIsSignUp(false);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          console.error('Erro de login:', error);
          toast.error(error.message || 'Erro ao fazer login');
        } else {
          console.log('Login bem-sucedido, redirecionando...');
          toast.success('Login realizado com sucesso!');
          // Pequeno delay para garantir que o estado foi atualizado
          setTimeout(() => {
            navigate('/');
          }, 100);
        }
      }
    } catch (error) {
      console.error('Erro no handleSubmit:', error);
      toast.error('Erro ao processar requisição');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Solana Merchant AI</h1>
          <p className="text-muted-foreground">Escolha como deseja autenticar</p>
        </div>

        <Tabs defaultValue="passkey" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="passkey">
              🔐 Passkeys (Recomendado)
            </TabsTrigger>
            <TabsTrigger value="email">
              📧 Email & Senha
            </TabsTrigger>
          </TabsList>

          <TabsContent value="passkey">
            <PasskeyOnboarding />
          </TabsContent>

          <TabsContent value="email">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>{isSignUp ? 'Criar Conta' : 'Login'}</CardTitle>
                <CardDescription>
                  {isSignUp
                    ? 'Crie uma nova conta para acessar o sistema'
                    : 'Entre com suas credenciais'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Processando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {isSignUp ? 'Já tem conta? Faça login' : 'Não tem conta? Crie uma'}
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
