import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Reveal } from '../components/ui/Reveal';
import './Studio.css';
export function Studio(){const {t}=useLanguage();return <div className="studio-page"><div className="studio-page__hero"><div className="container"><Link to="/" className="back-link">{t('common.back')}</Link><Reveal><h1>{t('studio.title')}</h1><p>{t('studio.body')}</p></Reveal></div></div><section className="container studio-page__grid"><Reveal><article><span>01</span><h2>{t('studio.vision')}</h2><p>{t('studio.visionCopy')}</p></article></Reveal><Reveal delay={100}><article><span>02</span><h2>{t('studio.craft')}</h2><p>{t('studio.craftCopy')}</p></article></Reveal></section><section className="studio-page__quote"><Reveal><p>“We don't make safe worlds.”</p></Reveal></section></div>}
