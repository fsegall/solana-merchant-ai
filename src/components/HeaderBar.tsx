import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, Globe, ArrowLeft, Mic, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMerchant } from '@/hooks/useMerchant';
import { useTranslation } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { VoiceInput } from '@/components/VoiceInput';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useLogout as useParaLogout } from '@/contexts/ParaProvider';
import { useWallet } from '@solana/wallet-adapter-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderBarProps {
  showBack?: boolean;
  title?: string;
}

export function HeaderBar({ showBack, title }: HeaderBarProps) {
  const navigate = useNavigate();
  const { flags } = useMerchant();
  const { lang, setLanguage } = useTranslation();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { toast } = useToast();
  
  // Logout hooks
  const { mutate: logoutPara } = useParaLogout();
  const { disconnect: disconnectWallet } = useWallet();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLogout = async () => {
    try {
      // 1. Desconectar do Supabase Auth (email/senha)
      await supabase.auth.signOut();
      
      // 2. Desconectar Para SDK (Passkeys)
      try {
        logoutPara();
      } catch (e) {
        console.log('Para logout (sem wallet ativa):', e);
      }
      
      // 3. Desconectar wallet externa (Phantom, Solflare, etc)
      try {
        await disconnectWallet();
      } catch (e) {
        console.log('Wallet disconnect (sem wallet ativa):', e);
      }
      
      toast({
        title: '👋 Desconectado',
        description: 'Você foi desconectado com sucesso',
      });
      
      // Redirecionar para a tela de login
      navigate('/auth');
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast({
        title: '❌ Erro ao desconectar',
        description: 'Ocorreu um erro ao desconectar',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          {title && <h1 className="text-lg font-semibold">{title}</h1>}
          {flags && flags.demoMode && <Badge variant="secondary">Demo</Badge>}
        </div>

        <div className="flex items-center gap-2">
          {/* Solana Wallet Button */}
          <WalletMultiButton />
          
          {/* Logout Button - sempre visível */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="border-red-500/50 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400"
            aria-label="Desconectar"
            title="Desconectar"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            Sair
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Voice assistant">
                <Mic className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <VoiceInput />
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                English {lang === 'en' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('pt')}>
                Português {lang === 'pt' && '✓'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
