/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package mks.dms.dao.entity;

import java.io.Serializable;
import java.util.Collection;
import java.util.Date;
import javax.persistence.Basic;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;

/**
 *
 * @author ThachLe
 */
@Entity
@Table(name = "request")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "Request.findAll", query = "SELECT r FROM Request r"),
    @NamedQuery(name = "Request.findById", query = "SELECT r FROM Request r WHERE r.id = :id"),
    @NamedQuery(name = "Request.findByRequesttypeId", query = "SELECT r FROM Request r WHERE r.requesttypeId = :requesttypeId"),
    @NamedQuery(name = "Request.findByRequesttypeCd", query = "SELECT r FROM Request r WHERE r.requesttypeCd = :requesttypeCd"),
    @NamedQuery(name = "Request.findByRequesttypeName", query = "SELECT r FROM Request r WHERE r.requesttypeName = :requesttypeName"),
    @NamedQuery(name = "Request.findByTitle", query = "SELECT r FROM Request r WHERE r.title = :title"),
    @NamedQuery(name = "Request.findByStartdate", query = "SELECT r FROM Request r WHERE r.startdate = :startdate"),
    @NamedQuery(name = "Request.findByEnddate", query = "SELECT r FROM Request r WHERE r.enddate = :enddate"),
    @NamedQuery(name = "Request.findByAssignedCd", query = "SELECT r FROM Request r WHERE r.assignedCd = :assignedCd"),
    @NamedQuery(name = "Request.findByAssignedName", query = "SELECT r FROM Request r WHERE r.assignedName = :assignedName"),
    @NamedQuery(name = "Request.findByWatchersId", query = "SELECT r FROM Request r WHERE r.watchersId = :watchersId"),
    @NamedQuery(name = "Request.findByManagerCd", query = "SELECT r FROM Request r WHERE r.managerCd = :managerCd"),
    @NamedQuery(name = "Request.findByManagerName", query = "SELECT r FROM Request r WHERE r.managerName = :managerName"),
    @NamedQuery(name = "Request.findByLabel1", query = "SELECT r FROM Request r WHERE r.label1 = :label1"),
    @NamedQuery(name = "Request.findByLabel2", query = "SELECT r FROM Request r WHERE r.label2 = :label2"),
    @NamedQuery(name = "Request.findByLabel3", query = "SELECT r FROM Request r WHERE r.label3 = :label3"),
    @NamedQuery(name = "Request.findByDuration", query = "SELECT r FROM Request r WHERE r.duration = :duration"),
    @NamedQuery(name = "Request.findByDurationunit", query = "SELECT r FROM Request r WHERE r.durationunit = :durationunit"),
    @NamedQuery(name = "Request.findByStatus", query = "SELECT r FROM Request r WHERE r.status = :status"),
    @NamedQuery(name = "Request.findByCreatorRead", query = "SELECT r FROM Request r WHERE r.creatorRead = :creatorRead"),
    @NamedQuery(name = "Request.findByManagerRead", query = "SELECT r FROM Request r WHERE r.managerRead = :managerRead"),
    @NamedQuery(name = "Request.findByAssignerRead", query = "SELECT r FROM Request r WHERE r.assignerRead = :assignerRead"),
    @NamedQuery(name = "Request.findByPlaneffort", query = "SELECT r FROM Request r WHERE r.planeffort = :planeffort"),
    @NamedQuery(name = "Request.findByPlanunit", query = "SELECT r FROM Request r WHERE r.planunit = :planunit"),
    @NamedQuery(name = "Request.findByCreated", query = "SELECT r FROM Request r WHERE r.created = :created"),
    @NamedQuery(name = "Request.findByCreatedbyCd", query = "SELECT r FROM Request r WHERE r.createdbyCd = :createdbyCd"),
    @NamedQuery(name = "Request.findByCreatedbyName", query = "SELECT r FROM Request r WHERE r.createdbyName = :createdbyName"),
    @NamedQuery(name = "Request.findByLastmodified", query = "SELECT r FROM Request r WHERE r.lastmodified = :lastmodified"),
    @NamedQuery(name = "Request.findByLastmodifiedbyId", query = "SELECT r FROM Request r WHERE r.lastmodifiedbyId = :lastmodifiedbyId"),
    @NamedQuery(name = "Request.findByLastmodifiedbyName", query = "SELECT r FROM Request r WHERE r.lastmodifiedbyName = :lastmodifiedbyName"),
    @NamedQuery(name = "Request.findByLastmodifiedbyCd", query = "SELECT r FROM Request r WHERE r.lastmodifiedbyCd = :lastmodifiedbyCd")})
public class Request implements Serializable {
    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "ID")
    private Integer id;
    @Column(name = "REQUESTTYPE_ID")
    private Integer requesttypeId;
    @Column(name = "REQUESTTYPE_CD")
    private String requesttypeCd;
    @Column(name = "REQUESTTYPE_NAME")
    private String requesttypeName;
    @Basic(optional = false)
    @Column(name = "TITLE")
    private String title;
    @Lob
    @Column(name = "CONTENT")
    private String content;
    @Column(name = "STARTDATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date startdate;
    @Column(name = "ENDDATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date enddate;
    @Column(name = "ASSIGNED_CD")
    private String assignedCd;
    @Column(name = "ASSIGNED_NAME")
    private String assignedName;
    @Column(name = "WATCHERS_ID")
    private Integer watchersId;
    @Column(name = "MANAGER_CD")
    private String managerCd;
    @Column(name = "MANAGER_NAME")
    private String managerName;
    @Column(name = "LABEL1")
    private String label1;
    @Column(name = "LABEL2")
    private String label2;
    @Column(name = "LABEL3")
    private String label3;
    @Column(name = "DURATION")
    private Integer duration;
    @Column(name = "DURATIONUNIT")
    private Integer durationunit;
    @Column(name = "STATUS")
    private String status;
    @Lob
    @Column(name = "COMMENT")
    private String comment;
    @Column(name = "CREATOR_READ")
    private Integer creatorRead;
    @Column(name = "MANAGER_READ")
    private Integer managerRead;
    @Column(name = "ASSIGNER_READ")
    private Integer assignerRead;
    @Column(name = "PLANEFFORT")
    private Integer planeffort;
    @Column(name = "PLANUNIT")
    private String planunit;
    @Lob
    @Column(name = "ATTACHMENT1")
    private byte[] attachment1;
    @Lob
    @Column(name = "ATTACHMENT2")
    private byte[] attachment2;
    @Lob
    @Column(name = "ATTACHMENT3")
    private byte[] attachment3;
    @Basic(optional = false)
    @Column(name = "CREATED")
    @Temporal(TemporalType.TIMESTAMP)
    private Date created;
    @Column(name = "CREATEDBY_CD")
    private String createdbyCd;
    @Column(name = "CREATEDBY_NAME")
    private String createdbyName;
    @Column(name = "LASTMODIFIED")
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastmodified;
    @Column(name = "LASTMODIFIEDBY_ID")
    private Integer lastmodifiedbyId;
    @Column(name = "LASTMODIFIEDBY_NAME")
    private String lastmodifiedbyName;
    @Column(name = "LASTMODIFIEDBY_CD")
    private String lastmodifiedbyCd;
    @JoinColumn(name = "DEPARTMENTS_ID", referencedColumnName = "ID")
    @ManyToOne
    private Department departmentsId;
    @JoinColumn(name = "CREATEDBY_ID", referencedColumnName = "ID")
    @ManyToOne
    private User createdbyId;
    @JoinColumn(name = "MANAGER_ID", referencedColumnName = "ID")
    @ManyToOne
    private User managerId;
    @JoinColumn(name = "ASSIGNED_ID", referencedColumnName = "ID")
    @ManyToOne
    private User assignedId;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "reqId")
    private Collection<Watcher> watcherCollection;

    public Request() {
    }

    public Request(Integer id) {
        this.id = id;
    }

    public Request(Integer id, String title, Date created) {
        this.id = id;
        this.title = title;
        this.created = created;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getRequesttypeId() {
        return requesttypeId;
    }

    public void setRequesttypeId(Integer requesttypeId) {
        this.requesttypeId = requesttypeId;
    }

    public String getRequesttypeCd() {
        return requesttypeCd;
    }

    public void setRequesttypeCd(String requesttypeCd) {
        this.requesttypeCd = requesttypeCd;
    }

    public String getRequesttypeName() {
        return requesttypeName;
    }

    public void setRequesttypeName(String requesttypeName) {
        this.requesttypeName = requesttypeName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Date getStartdate() {
        return startdate;
    }

    public void setStartdate(Date startdate) {
        this.startdate = startdate;
    }

    public Date getEnddate() {
        return enddate;
    }

    public void setEnddate(Date enddate) {
        this.enddate = enddate;
    }

    public String getAssignedCd() {
        return assignedCd;
    }

    public void setAssignedCd(String assignedCd) {
        this.assignedCd = assignedCd;
    }

    public String getAssignedName() {
        return assignedName;
    }

    public void setAssignedName(String assignedName) {
        this.assignedName = assignedName;
    }

    public Integer getWatchersId() {
        return watchersId;
    }

    public void setWatchersId(Integer watchersId) {
        this.watchersId = watchersId;
    }

    public String getManagerCd() {
        return managerCd;
    }

    public void setManagerCd(String managerCd) {
        this.managerCd = managerCd;
    }

    public String getManagerName() {
        return managerName;
    }

    public void setManagerName(String managerName) {
        this.managerName = managerName;
    }

    public String getLabel1() {
        return label1;
    }

    public void setLabel1(String label1) {
        this.label1 = label1;
    }

    public String getLabel2() {
        return label2;
    }

    public void setLabel2(String label2) {
        this.label2 = label2;
    }

    public String getLabel3() {
        return label3;
    }

    public void setLabel3(String label3) {
        this.label3 = label3;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public Integer getDurationunit() {
        return durationunit;
    }

    public void setDurationunit(Integer durationunit) {
        this.durationunit = durationunit;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Integer getCreatorRead() {
        return creatorRead;
    }

    public void setCreatorRead(Integer creatorRead) {
        this.creatorRead = creatorRead;
    }

    public Integer getManagerRead() {
        return managerRead;
    }

    public void setManagerRead(Integer managerRead) {
        this.managerRead = managerRead;
    }

    public Integer getAssignerRead() {
        return assignerRead;
    }

    public void setAssignerRead(Integer assignerRead) {
        this.assignerRead = assignerRead;
    }

    public Integer getPlaneffort() {
        return planeffort;
    }

    public void setPlaneffort(Integer planeffort) {
        this.planeffort = planeffort;
    }

    public String getPlanunit() {
        return planunit;
    }

    public void setPlanunit(String planunit) {
        this.planunit = planunit;
    }

    public byte[] getAttachment1() {
        return attachment1;
    }

    public void setAttachment1(byte[] attachment1) {
        this.attachment1 = attachment1;
    }

    public byte[] getAttachment2() {
        return attachment2;
    }

    public void setAttachment2(byte[] attachment2) {
        this.attachment2 = attachment2;
    }

    public byte[] getAttachment3() {
        return attachment3;
    }

    public void setAttachment3(byte[] attachment3) {
        this.attachment3 = attachment3;
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    public String getCreatedbyCd() {
        return createdbyCd;
    }

    public void setCreatedbyCd(String createdbyCd) {
        this.createdbyCd = createdbyCd;
    }

    public String getCreatedbyName() {
        return createdbyName;
    }

    public void setCreatedbyName(String createdbyName) {
        this.createdbyName = createdbyName;
    }

    public Date getLastmodified() {
        return lastmodified;
    }

    public void setLastmodified(Date lastmodified) {
        this.lastmodified = lastmodified;
    }

    public Integer getLastmodifiedbyId() {
        return lastmodifiedbyId;
    }

    public void setLastmodifiedbyId(Integer lastmodifiedbyId) {
        this.lastmodifiedbyId = lastmodifiedbyId;
    }

    public String getLastmodifiedbyName() {
        return lastmodifiedbyName;
    }

    public void setLastmodifiedbyName(String lastmodifiedbyName) {
        this.lastmodifiedbyName = lastmodifiedbyName;
    }

    public String getLastmodifiedbyCd() {
        return lastmodifiedbyCd;
    }

    public void setLastmodifiedbyCd(String lastmodifiedbyCd) {
        this.lastmodifiedbyCd = lastmodifiedbyCd;
    }

    public Department getDepartmentsId() {
        return departmentsId;
    }

    public void setDepartmentsId(Department departmentsId) {
        this.departmentsId = departmentsId;
    }

    public User getCreatedbyId() {
        return createdbyId;
    }

    public void setCreatedbyId(User createdbyId) {
        this.createdbyId = createdbyId;
    }

    public User getManagerId() {
        return managerId;
    }

    public void setManagerId(User managerId) {
        this.managerId = managerId;
    }

    public User getAssignedId() {
        return assignedId;
    }

    public void setAssignedId(User assignedId) {
        this.assignedId = assignedId;
    }

    @XmlTransient
    public Collection<Watcher> getWatcherCollection() {
        return watcherCollection;
    }

    public void setWatcherCollection(Collection<Watcher> watcherCollection) {
        this.watcherCollection = watcherCollection;
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (id != null ? id.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof Request)) {
            return false;
        }
        Request other = (Request) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "mks.dms.dao.entity.Request[ id=" + id + " ]";
    }
    
}