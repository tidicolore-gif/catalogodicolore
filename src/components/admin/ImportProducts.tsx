import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileSpreadsheet, Upload, Link2, Loader2, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { DBProduct } from '@/hooks/useProducts';

interface ImportProductsProps {
  onImport: (products: Omit<DBProduct, 'id' | 'created_at' | 'updated_at'>[]) => Promise<boolean>;
}

interface PreviewProduct {
  procod: string;
  pronom: string;
  descricao: string;
  preco: number;
  grupo: string;
  categoria: string;
  ativo: boolean;
}

export function ImportProducts({ onImport }: ImportProductsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [previewData, setPreviewData] = useState<PreviewProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const parseExcel = (file: File) => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const products = jsonData.map((row: any) => ({
          procod: String(row.procod || row.codigo || row.ean || row.PROCOD || row.CODIGO || row.EAN || ''),
          pronom: String(row.pronom || row.nome || row.produto || row.PRONOM || row.NOME || row.PRODUTO || ''),
          descricao: String(row.descricao || row.DESCRICAO || ''),
          preco: parseFloat(String(row.preco || row.PRECO || row.valor || row.VALOR || '0').replace(',', '.')) || 0,
          grupo: String(row.grupo || row.GRUPO || ''),
          categoria: String(row.categoria || row.CATEGORIA || ''),
          ativo: row.ativo !== false && row.ATIVO !== false && row.ativo !== 'false' && row.ATIVO !== 'false',
          foto_url: null,
        })).filter(p => p.procod && p.pronom);

        setPreviewData(products);
        setIsLoading(false);
      } catch (err) {
        setError('Erro ao processar o arquivo. Verifique se o formato está correto.');
        setIsLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseExcel(file);
    }
  };

  const handleGoogleSheetImport = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Extract sheet ID from URL
      const match = googleSheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) {
        throw new Error('URL do Google Sheets inválida');
      }

      const sheetId = match[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error('Não foi possível acessar a planilha. Verifique se ela está pública.');
      }

      const csvText = await response.text();
      const workbook = XLSX.read(csvText, { type: 'string' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const products = jsonData.map((row: any) => ({
        procod: String(row.procod || row.codigo || row.ean || row.PROCOD || row.CODIGO || row.EAN || ''),
        pronom: String(row.pronom || row.nome || row.produto || row.PRONOM || row.NOME || row.PRODUTO || ''),
        descricao: String(row.descricao || row.DESCRICAO || ''),
        preco: parseFloat(String(row.preco || row.PRECO || row.valor || row.VALOR || '0').replace(',', '.')) || 0,
        grupo: String(row.grupo || row.GRUPO || ''),
        categoria: String(row.categoria || row.CATEGORIA || ''),
        ativo: row.ativo !== false && row.ATIVO !== false && row.ativo !== 'false' && row.ATIVO !== 'false',
        foto_url: null,
      })).filter(p => p.procod && p.pronom);

      setPreviewData(products);
    } catch (err: any) {
      setError(err.message || 'Erro ao importar do Google Sheets');
    }

    setIsLoading(false);
  };

  const handleConfirmImport = async () => {
    setIsLoading(true);
    setError('');
    
    const result = await onImport(previewData.map(p => ({
      ...p,
      foto_url: null,
    })));

    if (result) {
      setSuccess(`${previewData.length} produtos importados com sucesso!`);
      setPreviewData([]);
    }
    
    setIsLoading(false);
  };

  const downloadTemplate = () => {
    const template = [
      {
        procod: '7898418096059',
        pronom: 'EXEMPLO SHAMPOO 250ML',
        descricao: 'Descrição do produto',
        preco: '29.90',
        grupo: 'LINHA DICCO',
        categoria: 'Linha Dicco',
        ativo: 'true',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Produtos');
    XLSX.writeFile(wb, 'modelo_importacao_produtos.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Importar Produtos</h2>
          <p className="text-sm text-muted-foreground">
            Importe produtos em massa através de planilha ou Google Sheets
          </p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Baixar Modelo
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-accent text-accent-foreground bg-accent/10">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="file">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Upload de Arquivo
          </TabsTrigger>
          <TabsTrigger value="google">
            <Link2 className="h-4 w-4 mr-2" />
            Google Sheets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload de Planilha</CardTitle>
              <CardDescription>
                Faça upload de um arquivo Excel (.xlsx, .xls) ou CSV
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Clique para selecionar ou arraste um arquivo
                </p>
                <p className="text-xs text-muted-foreground">
                  Suporta .xlsx, .xls, .csv
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="google" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Google Sheets</CardTitle>
              <CardDescription>
                Cole o link de uma planilha pública do Google Sheets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sheetUrl">URL da Planilha</Label>
                <Input
                  id="sheetUrl"
                  type="url"
                  value={googleSheetUrl}
                  onChange={(e) => setGoogleSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                />
                <p className="text-xs text-muted-foreground">
                  A planilha deve estar configurada como "Qualquer pessoa com o link pode ver"
                </p>
              </div>
              <Button 
                onClick={handleGoogleSheetImport} 
                disabled={!googleSheetUrl || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Importar do Google Sheets
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview */}
      {previewData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Pré-visualização</CardTitle>
                <CardDescription>
                  {previewData.length} produtos prontos para importar
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPreviewData([])}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleConfirmImport} 
                  disabled={isLoading}
                  className="gradient-rose"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar Importação
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 50).map((product, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs">{product.procod}</TableCell>
                      <TableCell className="max-w-xs truncate">{product.pronom}</TableCell>
                      <TableCell>{product.grupo}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }).format(product.preco)}
                      </TableCell>
                      <TableCell>{product.ativo ? 'Ativo' : 'Inativo'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {previewData.length > 50 && (
                <div className="p-4 text-center text-sm text-muted-foreground border-t">
                  Mostrando 50 de {previewData.length} produtos
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
