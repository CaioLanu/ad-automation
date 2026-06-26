import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AdUser, AdUserCreateInput } from '@/lib/api';

type UserDialogProps = {
  open: boolean;
  busy?: boolean;
  user?: AdUser | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AdUserCreateInput) => Promise<void>;
};

export function UserDialog({ open, busy = false, user, onOpenChange, onSubmit }: UserDialogProps) {
  const isEdit = Boolean(user);
  const [sector, setSector] = useState('');
  const [name, setName] = useState('');
  const [rgLogin, setRgLogin] = useState('');
  const [functionalId, setFunctionalId] = useState('');
  const [cpf, setCpf] = useState('');
  const [role, setRole] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [personalPhone, setPersonalPhone] = useState('');
  const [profile, setProfile] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setSector(user?.sector ?? '');
    setName(user?.name ?? '');
    setRgLogin(user?.rgLogin ?? '');
    setFunctionalId(user?.functionalId ?? '');
    setCpf(user?.cpf ?? '');
    setRole(user?.role ?? '');
    setPersonalEmail(user?.personalEmail ?? '');
    setPersonalPhone(user?.personalPhone ?? '');
    setProfile(user?.profile ?? '');
    setIsActive(user?.isActive ?? true);
  }, [user, open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      sector: sector.trim(),
      name: name.trim(),
      rgLogin: rgLogin.trim(),
      functionalId: functionalId.trim(),
      cpf: cpf.trim(),
      role: role.trim(),
      personalEmail: personalEmail.trim(),
      personalPhone: personalPhone.trim(),
      profile: profile.trim(),
      isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar usuário AD' : 'Novo usuário AD'}</DialogTitle>
          <DialogDescription>
            Preencha os campos no padrão da planilha XLSX. Grupos AD são derivados pelo backend quando necessário.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="sector">Setor/Sigla</Label>
              <Input id="sector" value={sector} onChange={(event) => setSector(event.target.value)} placeholder="Ex.: TI" disabled={busy} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: João da Silva" disabled={busy} required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="rgLogin">Rg/Login</Label>
              <Input id="rgLogin" value={rgLogin} onChange={(event) => setRgLogin(event.target.value)} placeholder="000000" disabled={busy} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="functionalId">Id Func.</Label>
              <Input id="functionalId" value={functionalId} onChange={(event) => setFunctionalId(event.target.value)} placeholder="12345" disabled={busy} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" value={cpf} onChange={(event) => setCpf(event.target.value)} placeholder="000.000.000-00" disabled={busy} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Cargo</Label>
              <Input id="role" value={role} onChange={(event) => setRole(event.target.value)} placeholder="Ex.: Analista" disabled={busy} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="personalEmail">E-mail (pessoal)</Label>
              <Input id="personalEmail" value={personalEmail} onChange={(event) => setPersonalEmail(event.target.value)} placeholder="email@dominio.com" disabled={busy} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="personalPhone">Celular (pessoal)</Label>
              <Input id="personalPhone" value={personalPhone} onChange={(event) => setPersonalPhone(event.target.value)} placeholder="(00) 00000-0000" disabled={busy} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="profile">Perfil</Label>
            <Input id="profile" value={profile} onChange={(event) => setProfile(event.target.value)} placeholder="Ex.: ADMIN" disabled={busy} required />
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground" htmlFor="isActive">
            <Checkbox id="isActive" checked={isActive} onCheckedChange={(checked: boolean | 'indeterminate') => setIsActive(checked === true)} disabled={busy} />
            Usuário ativo
          </label>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancelar</Button>
            <Button type="submit" disabled={busy}>{busy ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Cadastrar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
