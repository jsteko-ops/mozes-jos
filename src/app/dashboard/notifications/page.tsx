"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  writeBatch,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  useRouter,
} from "next/navigation";

import {
  auth,
  db,
} from "@/lib/firebase";


type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  type?: string;
  createdAt?: any;
};


type Filter =
  | "all"
  | "new"
  | "read";


function formatExactDate(
  timestamp: any
) {
  if (!timestamp) {
    return "-";
  }

  const date =
    timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleString(
    "hr-HR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


function formatNotificationTime(
  timestamp: any
) {
  if (!timestamp) {
    return "-";
  }

  const date =
    timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }


  const now =
    new Date();


  const diff =
    Math.floor(
      (
        now.getTime() -
        date.getTime()
      ) / 1000
    );


  if (diff < 60) {
    return "Upravo sada";
  }


  if (diff < 3600) {
    return `Prije ${Math.floor(
      diff / 60
    )} min`;
  }


  const isToday =
    date.toDateString() ===
    now.toDateString();


  if (isToday) {
    return `Danas u ${date.toLocaleTimeString(
      "hr-HR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    )}`;
  }


  const yesterday =
    new Date();

  yesterday.setDate(
    now.getDate() - 1
  );


  if (
    date.toDateString() ===
    yesterday.toDateString()
  ) {
    return `Jučer u ${date.toLocaleTimeString(
      "hr-HR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    )}`;
  }


  return date.toLocaleDateString(
    "hr-HR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}


function notificationIcon(
  type?: string
) {
  switch (type) {
    case "checkin":
    case "checkin_reply":
      return "✓";

    case "chat":
      return "💬";

    case "plan":
      return "🏋️";

    case "nutrition":
      return "🥗";

    case "measurement":
      return "📏";

    case "safe_report":
      return "🛡️";

    default:
      return "🔔";
  }
}


export default function NotificationsPage() {
  const router =
    useRouter();


  const [
    notifications,
    setNotifications,
  ] =
    useState<Notification[]>(
      []
    );


  const [
    userId,
    setUserId,
  ] =
    useState<string | null>(
      null
    );


  const [
    filter,
    setFilter,
  ] =
    useState<Filter>(
      "all"
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
          if (user) {
            setUserId(
              user.uid
            );
          } else {
            setUserId(
              null
            );

            setNotifications(
              []
            );

            setLoading(
              false
            );
          }
        }
      );


    return () =>
      unsubscribe();
  }, []);


  useEffect(() => {
    if (!userId) {
      return;
    }


    setLoading(true);


    const notificationsQuery =
      query(
        collection(
          db,
          "notifications"
        ),

        where(
          "userId",
          "==",
          userId
        ),

        orderBy(
          "createdAt",
          "desc"
        )
      );


    const unsubscribe =
      onSnapshot(
        notificationsQuery,

        (snapshot) => {
          const data =
            snapshot.docs.map(
              (item) => ({
                id:
                  item.id,

                ...item.data(),
              } as Notification)
            );


          setNotifications(
            data
          );

          setLoading(
            false
          );
        },

        (error) => {
          console.error(
            "Greška kod učitavanja obavijesti:",
            error
          );

          setLoading(
            false
          );
        }
      );


    return () =>
      unsubscribe();
  }, [userId]);


  async function markAllRead() {
    if (!userId) {
      return;
    }


    const unread =
      notifications.filter(
        (notification) =>
          !notification.read
      );


    if (
      unread.length === 0
    ) {
      return;
    }


    const batch =
      writeBatch(db);


    unread.forEach(
      (notification) => {
        batch.update(
          doc(
            db,
            "notifications",
            notification.id
          ),
          {
            read: true,
          }
        );
      }
    );


    await batch.commit();
  }


  async function deleteNotification(
    id: string
  ) {
    try {
      await deleteDoc(
        doc(
          db,
          "notifications",
          id
        )
      );
    } catch (error) {
      console.error(
        "Greška kod brisanja obavijesti:",
        error
      );

      alert(
        "Obavijest se nije mogla obrisati."
      );
    }
  }


  async function deleteReadNotifications() {
    const readNotifications =
      notifications.filter(
        (notification) =>
          notification.read
      );


    try {
      for (
        const notification
        of readNotifications
      ) {
        await deleteDoc(
          doc(
            db,
            "notifications",
            notification.id
          )
        );
      }
    } catch (error) {
      console.error(
        "Greška kod brisanja pročitanih obavijesti:",
        error
      );

      alert(
        "Pročitane obavijesti nisu se mogle obrisati."
      );
    }
  }


  async function openNotification(
    notification: Notification
  ) {
    try {
      if (
        !notification.read
      ) {
        await updateDoc(
          doc(
            db,
            "notifications",
            notification.id
          ),
          {
            read: true,
          }
        );
      }


      if (
        notification.link
      ) {
        router.push(
          notification.link
        );
      }
    } catch (error) {
      console.error(
        "Greška kod otvaranja obavijesti:",
        error
      );
    }
  }


  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;


  const readCount =
    notifications.filter(
      (notification) =>
        notification.read
    ).length;


  const filteredNotifications =
    notifications.filter(
      (notification) => {
        if (
          filter === "new"
        ) {
          return !notification.read;
        }


        if (
          filter === "read"
        ) {
          return notification.read;
        }


        return true;
      }
    );


  const filters: {
    id: Filter;
    label: string;
    count: number;
  }[] = [
    {
      id: "all",
      label: "Sve",
      count:
        notifications.length,
    },
    {
      id: "new",
      label: "Nove",
      count:
        unreadCount,
    },
    {
      id: "read",
      label: "Pročitane",
      count:
        readCount,
    },
  ];


  return (
    <div className="space-y-7">

      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>
          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.16em]
              text-[#16A6A1]
            "
          >
            Centar obavijesti
          </p>

          <h1
            className="
              mt-1
              text-3xl
              font-black
              tracking-tight
              text-[#15171A]
              sm:text-4xl
            "
          >
            Obavijesti
          </h1>

          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-[#667085]
            "
          >
            Na jednom mjestu prati
            nove poruke, Check-inove,
            planove i ostale aktivnosti.
          </p>
        </div>


        <div
          className="
            flex
            w-fit
            items-center
            gap-3
            rounded-2xl
            border
            border-[#E5E7EB]
            bg-white
            px-4
            py-3
            shadow-sm
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-[#C8D52B]/20
              text-lg
            "
          >
            🔔
          </div>


          <div>
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-[#98A2B3]
              "
            >
              Nepročitano
            </p>

            <p
              className="
                text-lg
                font-black
                text-[#15171A]
              "
            >
              {unreadCount}
            </p>
          </div>
        </div>
      </div>


      <div
        className="
          h-1
          w-20
          rounded-full
          bg-gradient-to-r
          from-[#C8D52B]
          to-[#16A6A1]
        "
      />


      {/* TOOLBAR */}

      <div
        className="
          flex
          flex-col
          gap-4
          rounded-2xl
          border
          border-[#E5E7EB]
          bg-white
          p-3
          shadow-sm
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >

        {/* FILTERS */}

        <div
          className="
            flex
            gap-2
            overflow-x-auto
          "
        >
          {filters.map(
            (item) => {
              const active =
                filter ===
                item.id;


              return (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  onClick={() =>
                    setFilter(
                      item.id
                    )
                  }
                  className={`
                    flex
                    shrink-0
                    items-center
                    gap-2
                    rounded-xl
                    px-4
                    py-2.5
                    text-sm
                    font-bold
                    transition

                    ${
                      active
                        ? `
                          bg-[#111317]
                          text-white
                        `
                        : `
                          bg-[#F4F6F2]
                          text-[#667085]
                          hover:text-[#15171A]
                        `
                    }
                  `}
                >
                  {item.label}

                  <span
                    className={`
                      rounded-full
                      px-2
                      py-0.5
                      text-[10px]
                      font-black

                      ${
                        active
                          ? `
                            bg-[#C8D52B]
                            text-[#111317]
                          `
                          : `
                            bg-white
                            text-[#667085]
                          `
                      }
                    `}
                  >
                    {item.count}
                  </span>
                </button>
              );
            }
          )}
        </div>


        {/* ACTIONS */}

        <div
          className="
            flex
            flex-wrap
            gap-2
          "
        >
          <button
            type="button"
            onClick={() =>
              void markAllRead()
            }
            disabled={
              unreadCount === 0
            }
            className="
              inline-flex
              min-h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#16A6A1]/10
              px-4
              py-2
              text-xs
              font-bold
              text-[#128D89]
              transition
              hover:bg-[#16A6A1]
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            ✓ Označi sve pročitano
          </button>


          <button
            type="button"
            onClick={() =>
              void deleteReadNotifications()
            }
            disabled={
              readCount === 0
            }
            className="
              inline-flex
              min-h-10
              items-center
              justify-center
              rounded-xl
              bg-red-50
              px-4
              py-2
              text-xs
              font-bold
              text-red-600
              transition
              hover:bg-red-600
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            Obriši pročitane
          </button>
        </div>
      </div>


      {/* LOADING */}

      {loading && (
        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-[#E5E7EB]
            bg-white
            shadow-sm
          "
        >
          {[1, 2, 3].map(
            (item) => (
              <div
                key={item}
                className="
                  flex
                  gap-4
                  border-b
                  border-[#EEF0EC]
                  p-5
                  last:border-b-0
                "
              >
                <div
                  className="
                    h-12
                    w-12
                    shrink-0
                    animate-pulse
                    rounded-xl
                    bg-[#E9ECE6]
                  "
                />

                <div
                  className="
                    flex-1
                    space-y-2
                  "
                >
                  <div
                    className="
                      h-4
                      w-1/3
                      animate-pulse
                      rounded
                      bg-[#E9ECE6]
                    "
                  />

                  <div
                    className="
                      h-3
                      w-2/3
                      animate-pulse
                      rounded
                      bg-[#F0F1EE]
                    "
                  />
                </div>
              </div>
            )
          )}
        </div>
      )}


      {/* EMPTY */}

      {!loading &&
        filteredNotifications.length ===
          0 && (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-[#D8DDD0]
              bg-white
              px-6
              py-14
              text-center
            "
          >
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-[#16A6A1]/10
                text-2xl
              "
            >
              🔔
            </div>

            <h2
              className="
                mt-5
                text-xl
                font-black
                text-[#15171A]
              "
            >
              Nema obavijesti
            </h2>

            <p
              className="
                mx-auto
                mt-2
                max-w-md
                text-sm
                leading-6
                text-[#667085]
              "
            >
              U odabranom prikazu
              trenutno nema obavijesti.
            </p>
          </div>
        )}


      {/* NOTIFICATION LIST */}

      {!loading &&
        filteredNotifications.length >
          0 && (
          <div
            className="
              overflow-hidden
              rounded-2xl
              border
              border-[#E5E7EB]
              bg-white
              shadow-sm
            "
          >
            {filteredNotifications.map(
              (notification) => (
                <div
                  key={
                    notification.id
                  }
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    void openNotification(
                      notification
                    )
                  }
                  onKeyDown={(
                    event
                  ) => {
                    if (
                      event.key ===
                        "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();

                      void openNotification(
                        notification
                      );
                    }
                  }}
                  className={`
                    group
                    relative
                    flex
                    cursor-pointer
                    gap-4
                    border-b
                    border-[#EEF0EC]
                    p-5
                    transition
                    last:border-b-0

                    ${
                      notification.read
                        ? `
                          bg-white
                          hover:bg-[#FBFCFA]
                        `
                        : `
                          bg-[#C8D52B]/5
                          hover:bg-[#C8D52B]/10
                        `
                    }
                  `}
                >

                  {!notification.read && (
                    <div
                      className="
                        absolute
                        bottom-0
                        left-0
                        top-0
                        w-1
                        bg-[#C8D52B]
                      "
                    />
                  )}


                  {/* ICON */}

                  <div
                    className={`
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      text-lg

                      ${
                        notification.read
                          ? `
                            bg-[#F4F6F2]
                          `
                          : `
                            bg-[#111317]
                          `
                      }
                    `}
                  >
                    {notificationIcon(
                      notification.type
                    )}
                  </div>


                  {/* CONTENT */}

                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >
                    <div
                      className="
                        flex
                        flex-col
                        gap-2
                        sm:flex-row
                        sm:items-start
                        sm:justify-between
                      "
                    >
                      <div
                        className="
                          min-w-0
                        "
                      >
                        <div
                          className="
                            flex
                            flex-wrap
                            items-center
                            gap-2
                          "
                        >
                          <h3
                            className={`
                              text-sm
                              text-[#15171A]

                              ${
                                notification.read
                                  ? "font-bold"
                                  : "font-black"
                              }
                            `}
                          >
                            {
                              notification.title
                            }
                          </h3>


                          {!notification.read && (
                            <span
                              className="
                                rounded-full
                                bg-[#C8D52B]
                                px-2
                                py-0.5
                                text-[9px]
                                font-black
                                uppercase
                                tracking-wider
                                text-[#111317]
                              "
                            >
                              Novo
                            </span>
                          )}
                        </div>


                        <p
                          className="
                            mt-2
                            text-sm
                            leading-6
                            text-[#667085]
                          "
                        >
                          {
                            notification.message
                          }
                        </p>
                      </div>


                      <div
                        className="
                          shrink-0
                          text-left
                          sm:text-right
                        "
                      >
                        <p
                          className="
                            text-[11px]
                            font-bold
                            text-[#16A6A1]
                          "
                        >
                          {formatNotificationTime(
                            notification.createdAt
                          )}
                        </p>

                        <p
                          className="
                            mt-1
                            text-[10px]
                            text-[#98A2B3]
                          "
                        >
                          {formatExactDate(
                            notification.createdAt
                          )}
                        </p>
                      </div>
                    </div>


                    <div
                      className="
                        mt-4
                        flex
                        items-center
                        justify-between
                        gap-4
                        border-t
                        border-[#EEF0EC]
                        pt-3
                      "
                    >
                      <span
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wider
                          text-[#98A2B3]
                        "
                      >
                        {notification.read
                          ? "Pročitano"
                          : "Klikni za otvaranje"}
                      </span>


                      <button
                        type="button"
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();

                          void deleteNotification(
                            notification.id
                          );
                        }}
                        className="
                          rounded-lg
                          px-2.5
                          py-1.5
                          text-xs
                          font-bold
                          text-red-500
                          transition
                          hover:bg-red-50
                          hover:text-red-600
                        "
                      >
                        Obriši
                      </button>
                    </div>
                  </div>

                </div>
              )
            )}
          </div>
        )}

    </div>
  );
}