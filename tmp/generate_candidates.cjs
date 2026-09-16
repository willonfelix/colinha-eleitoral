const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync('/tmp/candidates_raw.csv', 'utf-8');
const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

const items = [];
const header = lines[0];

for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(';');
  if (parts.length >= 3) {
    const ds_cargo = parts[0].trim().toUpperCase();
    const nr = parts[1].trim();
    let nome = parts[2].trim();
    
    // Fix known encoding corruption replacements
    nome = nome
      .replace(/JOS /g, 'JOSÉ ')
      .replace(/JOS$/g, 'JOSÉ')
      .replace(/CRTE/g, 'CÔRTE')
      .replace(/DIGENES/g, 'DIÓGENES')
      .replace(/ANDRA /g, 'ANDRÉA ')
      .replace(/FTIMA/g, 'FÁTIMA')
      .replace(/LCIA/g, 'LÚCIA')
      .replace(/RLA/g, 'RÔLA')
      .replace(/JOO /g, 'JOÃO ')
      .replace(/GONALVES/g, 'GONÇALVES')
      .replace(/LEO DE S/g, 'LEÃO DE SÁ')
      .replace(/VINCIUS/g, 'VINÍCIUS')
      .replace(/ROGRIO/g, 'ROGÉRIO')
      .replace(/CONCEIO/g, 'CONCEIÇÃO')
      .replace(/DURES/g, 'DURÃES')
      .replace(/ARAJO/g, 'ARAÚJO')
      .replace(/ANTNIO/g, 'ANTÔNIO')
      .replace(/OTVIO/g, 'OTÁVIO')
      .replace(/KILLA/g, 'ÁKILLA')
      .replace(/LTICIA/g, 'LETÍCIA')
      .replace(/HELVDIO/g, 'HELVÍDIO')
      .replace(/GUIMARES/g, 'GUIMARÃES')
      .replace(/VILLAS BAS/g, 'VILLAS BÔAS')
      .replace(/JLIO/g, 'JÚLIO')
      .replace(/MOURO/g, 'MOURÃO')
      .replace(/LVARO/g, 'ÁLVARO')
      .replace(/JNIOR/g, 'JÚNIOR')
      .replace(/MCIO/g, 'MÚCIO')
      .replace(/MARAL/g, 'MARÇAL')
      .replace(/AARO/g, 'AARÃO')
      .replace(/C$/g, 'CÁ')
      .replace(/EUGNIO/g, 'EUGÊNIO')
      .replace(/FLVIO/g, 'FLÁVIO')
      .replace(/HLVIA/g, 'HÉLVIA')
      .replace(/PARANAGU/g, 'PARANAGUÁ')
      .replace(/NATLIA/g, 'NATÁLIA')
      .replace(/JZER/g, 'JÂZER')
      .replace(/GATHA/g, 'ÁGATHA')
      .replace(/MNICA/g, 'MÔNICA')
      .replace(/JSSICA/g, 'JÉSSICA')
      .replace(/TRRES/g, 'TÔRRES')
      .replace(/LEITO/g, 'LEITÃO')
      .replace(/GARO/g, 'GARÇÃO')
      .replace(/CESRIO/g, 'CESÁRIO')
      .replace(/GIS /g, 'GÓIS ')
      .replace(/CAULECI/g, 'CAÇULECI')
      .replace(/CLUDIO/g, 'CLÁUDIO')
      .replace(/ANDR /g, 'ANDRÉ ')
      .replace(/OCTVIO/g, 'OCTÁVIO')
      .replace(/BARBAR /g, 'BARBARÁ ')
      .replace(/VTOR/g, 'VÍTOR')
      .replace(/ANGLICA/g, 'ANGÉLICA')
      .replace(/JUC /g, 'JUCÁ ')
      .replace(/FBIO/g, 'FÁBIO')
      .replace(/LOBO/g, 'LOBÃO')
      .replace(/FRANA/g, 'FRANÇA')
      .replace(/COLHO/g, 'COÊLHO')
      .replace(/VERTON/g, 'ÉVERTON')
      .replace(/GELCEMNIA/g, 'GELCEMÂNIA')
      .replace(/RENN /g, 'RENNÓ ')
      .replace(/TRSIS/g, 'TÂRSIS')
      .replace(/RGO/g, 'RÊGO')
      .replace(/INCIO/g, 'INÁCIO')
      .replace(/MENDONA/g, 'MENDONÇA')
      .replace(/ROBRIO/g, 'ROBÉRIO')
      .replace(/ S$/g, ' SÁ')
      .replace(/BRBARA/g, 'BÁRBARA')
      .replace(/HLIO/g, 'HÉLIO')
      .replace(/CLSTENES/g, 'CLÍSTENES');

    items.push({
      ds_cargo,
      nr,
      nome
    });
  }
}

console.log('Parsed items count:', items.length);

const outContent = `export interface CandidateRecord {
  id: string;
  ds_cargo: string;
  nr_candidato: string;
  nm_candidato: string;
}

export const INITIAL_CANDIDATES_LIST: Array<{ ds_cargo: string; nr: string; nome: string }> = ${JSON.stringify(items, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/db/candidatesData.ts'), outContent, 'utf-8');
console.log('Successfully written to src/db/candidatesData.ts');
