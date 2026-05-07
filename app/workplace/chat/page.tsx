export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  AtSign,
  Building2,
  Camera,
  Globe2,
  MessageCirclePlus,
  MessageSquareText,
  Send,
  UserCircle2
} from "lucide-react";

import WorkplaceShell from "@/components/workplace/WorkplaceShell";
import { prisma } from "@/lib/prisma";
import { requireWorkplaceContext, slugifyWorkplace } from "@/lib/workplace";
import { createWorkplaceChatRoomAction, sendWorkplaceChatMessageAction } from "./actions";

type Props = {
  searchParams?: Promise<{ roomId?: string }>;
};

const formatTime = (value: Date) =>
  new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);

async function ensureBaseRooms() {
  const departments = await prisma.workplaceDepartment.findMany({ where: { active: true }, select: { id: true, name: true, slug: true } });
  await prisma.workplaceChatRoom.upsert({
    where: { slug: "global-workplace" },
    update: {},
    create: {
      title: "Canal general Proactivitis",
      slug: "global-workplace",
      description: "Coordinacion interna global entre departamentos.",
      visibility: "GLOBAL"
    }
  });
  for (const department of departments) {
    await prisma.workplaceChatRoom.upsert({
      where: { slug: `departamento-${department.slug}` },
      update: {},
      create: {
        title: `Departamento ${department.name}`,
        slug: `departamento-${department.slug}`,
        description: `Conversacion operativa del departamento ${department.name}.`,
        departmentId: department.id,
        visibility: "DEPARTMENT"
      }
    });
  }
  return departments;
}

export default async function WorkplaceChatPage({ searchParams }: Props) {
  const context = await requireWorkplaceContext("chat.view");
  const params = (searchParams ? await searchParams : undefined) ?? {};
  const departments = await ensureBaseRooms();

  const roomWhere = context.isAdmin
    ? {}
    : {
        OR: [
          { visibility: "GLOBAL" },
          { createdById: context.employee?.id ?? "__none__" },
          { departmentId: context.employee?.departmentId ?? "__none__" },
          {
            mentions: {
              some: {
                OR: [
                  { employeeId: context.employee?.id ?? "__none__" },
                  { departmentId: context.employee?.departmentId ?? "__none__" }
                ]
              }
            }
          }
        ]
      };

  const rooms = await prisma.workplaceChatRoom.findMany({
    where: roomWhere,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    include: {
      department: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, createdAt: true, senderName: true }
      },
      _count: { select: { messages: true, mentions: true } }
    }
  });

  const selectedRoomId = params.roomId && rooms.some((room) => room.id === params.roomId) ? params.roomId : rooms[0]?.id;
  const selectedRoom = selectedRoomId
    ? await prisma.workplaceChatRoom.findUnique({
        where: { id: selectedRoomId },
        include: {
          department: true,
          messages: {
            orderBy: { createdAt: "asc" },
            take: 160
          }
        }
      })
    : null;

  const canRespond = context.isAdmin || context.permissions.has("chat.respond");

  return (
    <WorkplaceShell
      active="chat"
      employeeName={context.user.name}
      department={context.employee?.department?.name ?? "Workplace"}
      permissions={context.permissions}
      scope={context.scope}
    >
      <div className="space-y-6 pb-10">
        <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/15 text-cyan-100">
              <MessageSquareText className="h-6 w-6" aria-hidden />
            </span>
            <p className="text-xs font-bold text-slate-400">Inicio / Chat</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">Chat corporativo</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Menciona departamentos con <span className="font-black text-cyan-200">@Soporte</span>, <span className="font-black text-cyan-200">@Tours</span> o <span className="font-black text-cyan-200">@Rent-Car</span>.
              El admin ve todos los canales y puede responder.
            </p>
          </div>
          <Link href="/workplace/profile" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-sm font-black text-slate-200 hover:border-cyan-300/50">
            <Camera className="h-4 w-4" aria-hidden />
            <span>Mi foto de perfil</span>
          </Link>
        </section>

        <section className="grid gap-5 xl:grid-cols-[360px,1fr]">
          <aside className="space-y-4">
            <form action={createWorkplaceChatRoomAction} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
                <MessageCirclePlus className="h-4 w-4" aria-hidden />
                <span>Nueva sala</span>
              </p>
              <input
                name="title"
                placeholder="Tema o incidencia interna"
                className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
              />
              <textarea
                name="description"
                placeholder="Contexto breve"
                className="mt-3 min-h-20 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
              />
              <div className="mt-3 grid gap-3">
                <select
                  name="departmentId"
                  defaultValue={context.employee?.departmentId ?? ""}
                  disabled={!context.isAdmin}
                  className="rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
                >
                  <option value="">Canal global</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>{department.name}</option>
                  ))}
                </select>
                {context.isAdmin ? (
                  <select name="visibility" className="rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white outline-none">
                    <option value="DEPARTMENT">Solo departamento</option>
                    <option value="GLOBAL">Global</option>
                  </select>
                ) : null}
              </div>
              <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950">
                <MessageCirclePlus className="h-4 w-4" aria-hidden />
                <span>Crear sala</span>
              </button>
            </form>

            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]">
              <div className="border-b border-white/10 px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Conversaciones</p>
              </div>
              <div className="max-h-[620px] divide-y divide-white/10 overflow-y-auto">
                {rooms.length ? rooms.map((room) => {
                  const lastMessage = room.messages[0];
                  return (
                    <Link
                      key={room.id}
                      href={`/workplace/chat?roomId=${room.id}`}
                      className={`block px-4 py-4 transition ${selectedRoomId === room.id ? "bg-cyan-400/15" : "hover:bg-white/5"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-black text-white">{room.title}</p>
                          <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              {room.visibility === "GLOBAL" ? <Globe2 className="h-3.5 w-3.5" aria-hidden /> : <Building2 className="h-3.5 w-3.5" aria-hidden />}
                              {room.visibility === "GLOBAL" ? "Global" : room.department?.name ?? "Departamento"}
                            </span>
                          </p>
                        </div>
                        <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-black text-slate-300">{room._count.messages}</span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">
                        {lastMessage ? `${lastMessage.senderName ?? "Equipo"}: ${lastMessage.body}` : "Sin mensajes todavia."}
                      </p>
                      {lastMessage ? <p className="mt-2 text-[10px] text-slate-500">{formatTime(lastMessage.createdAt)}</p> : null}
                    </Link>
                  );
                }) : (
                  <p className="p-4 text-sm text-slate-400">No hay conversaciones disponibles para tu alcance.</p>
                )}
              </div>
            </div>
          </aside>

          <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035]">
            {selectedRoom ? (
              <>
                <header className="border-b border-white/10 bg-white/[0.04] px-5 py-4">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-200">
                        <span className="inline-flex items-center gap-2">
                          {selectedRoom.visibility === "GLOBAL" ? <Globe2 className="h-4 w-4" aria-hidden /> : <Building2 className="h-4 w-4" aria-hidden />}
                          {selectedRoom.visibility === "GLOBAL" ? "Canal global" : selectedRoom.department?.name ?? "Departamento"}
                        </span>
                      </p>
                      <h2 className="mt-1 text-2xl font-black text-white">{selectedRoom.title}</h2>
                    </div>
                    <span className="w-fit rounded-full border border-white/10 px-3 py-1 text-xs font-black text-slate-300">
                      {selectedRoom.messages.length} mensajes
                    </span>
                  </div>
                  {selectedRoom.description ? <p className="mt-2 text-sm text-slate-400">{selectedRoom.description}</p> : null}
                </header>

                <div className="min-h-[520px] space-y-4 px-5 py-5">
                  {selectedRoom.messages.length ? selectedRoom.messages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-cyan-400/10">
                        {message.senderAvatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={message.senderAvatarUrl} alt={message.senderName ?? "Empleado"} className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-sm font-black text-cyan-200">
                            {message.senderName ? (message.senderName ?? "P").slice(0, 1).toUpperCase() : <UserCircle2 className="h-5 w-5" aria-hidden />}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-black text-white">{message.senderName ?? "Equipo Proactivitis"}</p>
                            <p className="text-xs text-slate-400">
                              {message.senderDepartment ?? "Workplace"} - {message.senderPosition ?? "Equipo interno"}
                            </p>
                          </div>
                          <p className="text-xs text-slate-500">{formatTime(message.createdAt)}</p>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{message.body}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
                      <AtSign className="mx-auto mb-3 h-8 w-8 text-cyan-200" aria-hidden />
                      No hay mensajes. Inicia la conversacion y menciona un departamento si necesitas su apoyo.
                    </div>
                  )}
                </div>

                <footer className="border-t border-white/10 bg-[#081324] p-4">
                  {canRespond ? (
                    <form action={sendWorkplaceChatMessageAction} className="grid gap-3">
                      <input type="hidden" name="roomId" value={selectedRoom.id} />
                      <textarea
                        name="body"
                        placeholder="Escribe tu mensaje. Ejemplo: @Soporte revisar esta reserva..."
                        className="min-h-24 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
                      />
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-500">
                          Tus respuestas se muestran con tu nombre, departamento, cargo y foto de perfil.
                        </p>
                        <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-black text-slate-950">
                          <Send className="h-4 w-4" aria-hidden />
                          <span>Enviar mensaje</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                      Puedes ver esta conversacion, pero tu rol no permite responder.
                    </p>
                  )}
                </footer>
              </>
            ) : (
              <div className="grid min-h-[620px] place-items-center p-8 text-center">
                <div>
                  <p className="text-2xl font-black text-white">Sin salas visibles</p>
                  <p className="mt-2 text-sm text-slate-400">Cuando tengas una sala asignada por departamento aparecera aqui.</p>
                </div>
              </div>
            )}
          </article>
        </section>
      </div>
    </WorkplaceShell>
  );
}
