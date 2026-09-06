import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import {
  ArchiveBoxIcon,
  PhotoIcon,
  FingerPrintIcon,
  MapPinIcon,
  RadioIcon,
  ShieldCheckIcon,
  FireIcon,
  CloudIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ChevronRightIcon,
  WifiIcon,
} from '@heroicons/react/24/outline';

import { socket } from '@/lib/socket';

import { useApp } from '@/context/AppContext';

import { Card, SectionTitle } from '@/components/ui/Card';
import { Badge, severityTone } from '@/components/ui/Badge';

import { CaseInfoCard } from '@/components/CaseInfoCard';

import { fmtRelative } from '@/lib/format';


interface HardwareData {
  fingerprint?: {
    matched?: boolean;
    id?: number | null;
    confidence?: number;
  };

  fingerprintId?: number;

  matched?: boolean;

  confidence?: number;

  accessStatus?: string;

  buzzer?: boolean;

  timestamp?: string;
}


export function Dashboard() {

  const {
    evidence,
    audit,
    caseInfo,
  } = useApp();


  const [hardwareData, setHardwareData] =
    useState<HardwareData | null>(null);


  const [hardwareConnected, setHardwareConnected] =
    useState(false);


  // ============================================
  // SOCKET CONNECTION
  // ============================================

  useEffect(() => {

    const handleConnect = () => {

      console.log('Connected to DetectiveX backend');

      setHardwareConnected(true);

    };


    const handleDisconnect = () => {

      console.log('Disconnected from DetectiveX backend');

      setHardwareConnected(false);

    };


    const handleSensorUpdate = (data: HardwareData) => {

      console.log(
        'Sensor update received:',
        data
      );

      setHardwareData(data);

    };


    // IMPORTANT:
    // Check if socket is already connected

    setHardwareConnected(socket.connected);


    // Socket connection events

    socket.on(
      'connect',
      handleConnect
    );


    socket.on(
      'disconnect',
      handleDisconnect
    );


    // IMPORTANT:
    // This MUST match backend:
    // io.emit("sensor-update", latestHardwareData)

    socket.on(
      'sensor-update',
      handleSensorUpdate
    );


    return () => {

      socket.off(
        'connect',
        handleConnect
      );


      socket.off(
        'disconnect',
        handleDisconnect
      );


      socket.off(
        'sensor-update',
        handleSensorUpdate
      );

    };

  }, []);

  // ============================================
  // DASHBOARD STATISTICS
  // ============================================

  const total = evidence.length;


  const photos =
    evidence.filter(
      (e) => e.photo
    ).length;


  const prints =
    evidence.filter(
      (e) => e.fingerprintMatch
    ).length;


  const gps =
    evidence.filter(
      (e) => e.gps
    ).length;


  const rfid =
    evidence.filter(
      (e) => e.rfid
    ).length;


  const avgTemp =
    total > 0
      ? +(
        evidence.reduce(
          (sum, item) =>
            sum + item.temperature,
          0
        ) / total
      ).toFixed(1)
      : 0;


  const avgHum =
    total > 0
      ? Math.round(
        evidence.reduce(
          (sum, item) =>
            sum + item.humidity,
          0
        ) / total
      )
      : 0;



  // ============================================
  // CASE PROGRESS
  // ============================================

  const stageCounts =
    [
      'Collected',
      'Logged',
      'Reviewed',
      'Archived',
    ].map(
      (stage) => ({

        stage,

        count:
          evidence.filter(
            (item) =>
              item.stage === stage
          ).length,

      })
    );



  // ============================================
  // STAT CARDS
  // ============================================

  const stats = [

    {
      label: 'Total Evidence',
      value: total,
      icon: ArchiveBoxIcon,
      tone: 'fx-primary',
      bg: 'bg-forensic-primary/10',
    },


    {
      label: 'Photo Evidence',
      value: photos,
      icon: PhotoIcon,
      tone: 'text-forensic-secondary',
      bg: 'bg-forensic-secondary/10',
    },


    {
      label: 'Fingerprint Matches',
      value: prints,
      icon: FingerPrintIcon,
      tone: 'fx-primary',
      bg: 'bg-forensic-primary/10',
    },


    {
      label: 'GPS Tagged',
      value: gps,
      icon: MapPinIcon,
      tone: 'text-forensic-secondary',
      bg: 'bg-forensic-secondary/10',
    },


    {
      label: 'RFID Evidence',
      value: rfid,
      icon: RadioIcon,
      tone: 'fx-primary',
      bg: 'bg-forensic-primary/10',
    },


    {
      label: 'Case Status',
      value: caseInfo.status,
      icon: ShieldCheckIcon,
      tone: 'text-forensic-success',
      bg: 'bg-forensic-success/10',
    },


    {
      label: 'Avg Temperature',
      value: `${avgTemp}°C`,
      icon: FireIcon,
      tone: 'text-forensic-warning',
      bg: 'bg-forensic-warning/10',
    },


    {
      label: 'Avg Humidity',
      value: `${avgHum}%`,
      icon: CloudIcon,
      tone: 'text-forensic-secondary',
      bg: 'bg-forensic-secondary/10',
    },

  ];



  const recent =
    audit.slice(0, 6);



  // ============================================
  // GET FINGERPRINT VALUES
  // ============================================

  const fingerprintMatched =

    hardwareData?.fingerprint?.matched

    ??

    hardwareData?.matched

    ??

    false;



  const fingerprintId =

    hardwareData?.fingerprint?.id

    ??

    hardwareData?.fingerprintId

    ??

    null;



  const fingerprintConfidence =

    hardwareData?.fingerprint?.confidence

    ??

    hardwareData?.confidence

    ??

    null;



  const accessStatus =

    hardwareData?.accessStatus

    ??

    'WAITING';



  // ============================================
  // UI
  // ============================================

  return (

    <div className="space-y-6">


      {/* ===================================== */}
      {/* DASHBOARD TITLE */}
      {/* ===================================== */}

      <div>

        <h1 className="text-2xl font-bold fx-text tracking-tight">

          Investigation Dashboard

        </h1>


        <p className="text-sm fx-muted mt-1">

          Real-time overview of{' '}

          {caseInfo.caseNumber}

          {' — '}

          {caseInfo.crimeType}

        </p>

      </div>



      {/* ===================================== */}
      {/* LIVE HARDWARE MONITOR */}
      {/* ===================================== */}

      <Card className="p-5">

        <div className="flex items-start justify-between">


          <div className="flex items-center gap-3">


            <div className="h-10 w-10 rounded-xl bg-forensic-primary/10 grid place-items-center">

              <WifiIcon className="h-5 w-5 fx-primary" />

            </div>


            <div>

              <h2 className="text-base font-semibold fx-text">

                Live Hardware Monitor

              </h2>


              <p className="text-xs fx-muted">

                Real-time fingerprint sensor data

              </p>

            </div>


          </div>



          <div className="flex items-center gap-2">

            <span

              className={`h-2.5 w-2.5 rounded-full ${hardwareConnected
                ? 'bg-green-500'
                : 'bg-red-500'
                }`}

            />


            <span

              className={`text-xs font-medium ${hardwareConnected
                ? 'text-green-500'
                : 'text-red-500'
                }`}

            >

              {hardwareConnected
                ? 'LIVE'
                : 'OFFLINE'}

            </span>

          </div>


        </div>



        {/* NO DATA */}

        {!hardwareData && (

          <div className="py-10 text-center">


            <FingerPrintIcon

              className="h-10 w-10 mx-auto fx-muted mb-3"

            />


            <p className="text-sm fx-muted">

              Waiting for fingerprint hardware data...

            </p>


          </div>

        )}



        {/* HARDWARE DATA */}

        {hardwareData && (

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">


            {/* Fingerprint ID */}

            <div className="fx-cardalt fx-border rounded-xl p-4">

              <p className="text-xs fx-muted">

                Fingerprint ID

              </p>


              <p className="text-2xl font-bold fx-text mt-2">

                {fingerprintId ?? '--'}

              </p>

            </div>



            {/* Match */}

            <div className="fx-cardalt fx-border rounded-xl p-4">

              <p className="text-xs fx-muted">

                Match Status

              </p>


              <p

                className={`text-lg font-bold mt-2 ${fingerprintMatched
                  ? 'text-green-500'
                  : 'text-red-500'
                  }`}

              >

                {fingerprintMatched
                  ? 'MATCHED'
                  : 'UNKNOWN'}

              </p>

            </div>



            {/* Confidence */}

            <div className="fx-cardalt fx-border rounded-xl p-4">

              <p className="text-xs fx-muted">

                Confidence

              </p>


              <p className="text-2xl font-bold fx-text mt-2">

                {fingerprintConfidence !== null
                  ? fingerprintConfidence
                  : '--'}

              </p>

            </div>



            {/* Access */}

            <div className="fx-cardalt fx-border rounded-xl p-4">

              <p className="text-xs fx-muted">

                Access Status

              </p>


              <p

                className={`text-lg font-bold mt-2 ${accessStatus === 'GRANTED'
                  ? 'text-green-500'
                  : accessStatus === 'DENIED'
                    ? 'text-red-500'
                    : 'fx-text'
                  }`}

              >

                {accessStatus}

              </p>

            </div>


          </div>

        )}


      </Card>



      {/* ===================================== */}
      {/* STAT CARDS */}
      {/* ===================================== */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">


        {stats.map((stat, index) => (

          <motion.div

            key={stat.label}

            initial={{

              opacity: 0,

              y: 20,

            }}

            animate={{

              opacity: 1,

              y: 0,

            }}

            transition={{

              delay: index * 0.06,

            }}

          >


            <Card

              className="p-4"

              whileHover={{

                y: -3,

              }}

            >


              <div

                className={`h-10 w-10 rounded-xl ${stat.bg} grid place-items-center ${stat.tone}`}

              >

                <stat.icon className="h-5 w-5" />

              </div>



              <p className="text-2xl font-bold fx-text mt-3 tabular-nums">

                {stat.value}

              </p>



              <p className="text-xs fx-muted mt-0.5">

                {stat.label}

              </p>


            </Card>


          </motion.div>

        ))}


      </div>



      {/* ===================================== */}
      {/* CASE INFO + RECENT ACTIVITY */}
      {/* ===================================== */}

      <div className="grid lg:grid-cols-3 gap-6">


        {/* LEFT */}

        <div className="lg:col-span-2 space-y-6">


          <CaseInfoCard />



          {/* CASE PROGRESS */}

          <Card className="p-5">


            <SectionTitle

              title="Case Progress"

              subtitle="Evidence pipeline by chain-of-custody stage"

              icon={

                <ArrowTrendingUpIcon className="h-5 w-5" />

              }

            />



            <div className="space-y-4">


              {stageCounts.map(

                (stageItem, index) => {


                  const percentage =

                    total > 0

                      ? Math.round(

                        (stageItem.count / total) * 100

                      )

                      : 0;



                  return (

                    <div

                      key={stageItem.stage}

                    >


                      <div className="flex justify-between text-sm mb-1.5">


                        <span className="fx-text font-medium">

                          {stageItem.stage}

                        </span>



                        <span className="fx-muted tabular-nums">

                          {stageItem.count}

                          {' / '}

                          {total}

                          {' · '}

                          {percentage}

                          %

                        </span>


                      </div>



                      <div className="h-2.5 rounded-full fx-cardalt overflow-hidden">


                        <motion.div

                          className="h-full rounded-full bg-gradient-to-r from-forensic-primary to-forensic-secondary"

                          initial={{

                            width: 0,

                          }}

                          animate={{

                            width: `${percentage}%`,

                          }}

                          transition={{

                            delay:

                              0.2 +

                              index * 0.1,

                            duration: 0.6,

                          }}

                        />


                      </div>


                    </div>

                  );

                }

              )}


            </div>


          </Card>


        </div>



        {/* RIGHT */}

        <Card className="p-5">


          <SectionTitle

            title="Recent Activity"

            subtitle="Latest audit trail events"

            icon={

              <ClockIcon className="h-5 w-5" />

            }

            action={

              <Link

                to="/audit"

                className="text-xs fx-primary hover:underline flex items-center gap-1"

              >

                View all

                <ChevronRightIcon className="h-3 w-3" />

              </Link>

            }

          />



          <div className="space-y-3">


            {recent.map(

              (activity, index) => (

                <motion.div

                  key={activity.id}

                  initial={{

                    opacity: 0,

                    x: 16,

                  }}

                  animate={{

                    opacity: 1,

                    x: 0,

                  }}

                  transition={{

                    delay: index * 0.05,

                  }}

                  className="flex gap-3 p-3 rounded-xl fx-cardalt fx-border"

                >


                  <div className="h-8 w-8 rounded-lg bg-forensic-primary/15 grid place-items-center shrink-0">


                    {activity.action.includes('Added')

                      ? (

                        <ArrowTrendingUpIcon className="h-4 w-4 fx-primary" />

                      )

                      : (

                        <ClockIcon className="h-4 w-4 fx-muted" />

                      )}


                  </div>



                  <div className="min-w-0">


                    <div className="flex items-center gap-2">


                      <Badge

                        tone="muted"

                        className="!px-2 !py-0.5 text-[10px]"

                      >

                        {activity.action}

                      </Badge>



                      <span className="text-[10px] fx-muted">

                        {fmtRelative(

                          activity.timestamp

                        )}

                      </span>


                    </div>



                    <p className="text-xs fx-text mt-1 truncate">

                      {activity.details}

                    </p>



                    <p className="text-[10px] fx-muted">

                      {activity.officer}

                    </p>


                  </div>


                </motion.div>

              )

            )}


          </div>


        </Card>


      </div>



      {/* ===================================== */}
      {/* LATEST EVIDENCE */}
      {/* ===================================== */}

      <Card className="p-5">


        <SectionTitle

          title="Latest Evidence"

          subtitle="Most recently logged items"

          icon={

            <ArchiveBoxIcon className="h-5 w-5" />

          }

          action={

            <Link

              to="/evidence"

              className="text-xs fx-primary hover:underline flex items-center gap-1"

            >

              Open intake

              <ChevronRightIcon className="h-3 w-3" />

            </Link>

          }

        />



        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">


          {evidence

            .slice(0, 4)

            .map(

              (item, index) => (

                <motion.div

                  key={item.id}

                  initial={{

                    opacity: 0,

                    scale: 0.95,

                  }}

                  animate={{

                    opacity: 1,

                    scale: 1,

                  }}

                  transition={{

                    delay: index * 0.06,

                  }}

                  className="fx-cardalt fx-border rounded-xl p-4"

                >


                  <div className="flex items-center justify-between mb-2">


                    <span className="font-mono text-sm font-semibold fx-primary">

                      {item.id}

                    </span>



                    <Badge

                      tone={

                        severityTone(

                          item.severity

                        )

                      }

                      className="!text-[10px]"

                    >

                      {item.severity}

                    </Badge>


                  </div>



                  <p className="text-sm fx-text font-medium">

                    {item.type}

                  </p>



                  <p className="text-xs fx-muted truncate">

                    {item.location}

                  </p>



                  <div className="flex items-center justify-between mt-3 text-[10px] fx-muted">


                    <span>

                      {fmtRelative(

                        item.timestamp

                      )}

                    </span>



                    <span>

                      {item.stage}

                    </span>


                  </div>


                </motion.div>

              )

            )}


        </div>


      </Card>


    </div>

  );

}