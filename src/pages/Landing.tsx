import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Wallet, Receipt, FileText, ArrowRight } from 'lucide-react';
import { useMerchant } from '@/hooks/useMerchant';
import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { BottomTabs } from '@/components/BottomTabs';
import { HeaderBar } from '@/components/HeaderBar';

export default function Landing() {
  const { t } = useTranslation();
  const { flags, updateFlags } = useMerchant();

  const features = [
    {
      icon: Wallet,
      title: t('landing.feature1'),
      description: t('landing.feature1Desc'),
    },
    {
      icon: Receipt,
      title: t('landing.feature2'),
      description: t('landing.feature2Desc'),
    },
    {
      icon: FileText,
      title: t('landing.feature3'),
      description: t('landing.feature3Desc'),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <HeaderBar title={t('landing.title')} />
      <div className="container mx-auto px-4 py-16 max-w-6xl flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          {flags?.demoMode && (
            <Badge variant="secondary" className="mb-4">
              {t('landing.demo')}
            </Badge>
          )}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Merchant AI Checkout
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('landing.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link to="/pos">
              <Button size="lg" className="min-w-[200px] h-14 text-lg">
                {t('landing.openPos')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>

            <div className="flex items-center gap-2">
              <Switch
                checked={flags?.demoMode || false}
                onCheckedChange={(checked) => updateFlags({ demoMode: checked })}
              />
              <span className="text-sm font-medium">{t('landing.demo')}</span>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Card className="p-8 max-w-2xl mx-auto bg-primary/5 border-primary/20">
            <h2 className="text-2xl font-bold mb-4">{t('landing.ctaTitle')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('landing.ctaDescription')}
            </p>
            <Link to="/onboarding">
              <Button variant="outline" size="lg">
                {t('landing.ctaButton')}
              </Button>
            </Link>
          </Card>
        </motion.div>
      </div>

      <BottomTabs />
    </div>
  );
}
