import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, Globe, ArrowLeft, Mic, LogOut, MoreHorizontal } from 'lucide-react';
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
  titleShort?: string; // shown on extra-small screens
}

export function HeaderBar({ showBack, title, titleShort }: HeaderBarProps) {
  const navigate = useNavigate();
  const { flags } = useMerchant();
  const { lang, setLanguage, t } = useTranslation();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { toast } = useToast();
  
  // Logout hooks
  const logout = useParaLogout();
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
        await logout.logoutAsync();
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
          {title && (
            <>
              {/* Short title on xs, full title from sm+ */}
              <h1 className="text-base font-semibold sm:hidden">{titleShort || title}</h1>
              <h1 className="hidden sm:block text-lg font-semibold">{title}</h1>
            </>
          )}
          {flags && flags.demoMode && <Badge variant="secondary">Demo</Badge>}
        </div>

        {/* Mobile (xs) compact controls */}
        <div className="flex items-center gap-1 sm:hidden">
          {/* Wallet */}
          <WalletMultiButton className="h-8 px-2 text-xs leading-none sm:h-9 sm:px-3 sm:text-sm" />
          {/* Voice */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t('header.voiceAssistant')}>
                <Mic className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <VoiceInput />
            </PopoverContent>
          </Popover>
          {/* More menu: language, theme, logout */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="More">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')}>English {lang === 'en' && '✓'}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('pt')}>Português {lang === 'pt' && '✓'}</DropdownMenuItem>
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === 'light' ? 'Dark mode' : 'Light mode'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>{t('header.logout')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop / sm+ full controls */}
        <div className="hidden sm:flex items-center gap-2">
          <WalletMultiButton className="h-9 px-3 text-sm leading-none" />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="border-red-500/50 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400"
            aria-label={t('header.disconnect')}
            title={t('header.disconnect')}
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            {t('header.logout')}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t('header.voiceAssistant')}>
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
