/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package mks.dms.dao.entity;

import java.io.Serializable;
import java.util.Date;
import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.xml.bind.annotation.XmlRootElement;

/**
 *
 * @author ThachLe
 */
@Entity
@Table(name = "parameter")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "Parameter.findAll", query = "SELECT p FROM Parameter p"),
    @NamedQuery(name = "Parameter.findById", query = "SELECT p FROM Parameter p WHERE p.id = :id"),
    @NamedQuery(name = "Parameter.findByCd", query = "SELECT p FROM Parameter p WHERE p.cd = :cd"),
    @NamedQuery(name = "Parameter.findByName", query = "SELECT p FROM Parameter p WHERE p.name = :name"),
    @NamedQuery(name = "Parameter.findByValue", query = "SELECT p FROM Parameter p WHERE p.value = :value"),
    @NamedQuery(name = "Parameter.findByDescription", query = "SELECT p FROM Parameter p WHERE p.description = :description"),
    @NamedQuery(name = "Parameter.findByEnabled", query = "SELECT p FROM Parameter p WHERE p.enabled = :enabled"),
    @NamedQuery(name = "Parameter.findByCreated", query = "SELECT p FROM Parameter p WHERE p.created = :created"),
    @NamedQuery(name = "Parameter.findByCreatedbyId", query = "SELECT p FROM Parameter p WHERE p.createdbyId = :createdbyId"),
    @NamedQuery(name = "Parameter.findByCreatedbyCd", query = "SELECT p FROM Parameter p WHERE p.createdbyCd = :createdbyCd"),
    @NamedQuery(name = "Parameter.findByCreatedbyName", query = "SELECT p FROM Parameter p WHERE p.createdbyName = :createdbyName"),
    @NamedQuery(name = "Parameter.findByLastmodified", query = "SELECT p FROM Parameter p WHERE p.lastmodified = :lastmodified"),
    @NamedQuery(name = "Parameter.findByLastmodifiedbyId", query = "SELECT p FROM Parameter p WHERE p.lastmodifiedbyId = :lastmodifiedbyId"),
    @NamedQuery(name = "Parameter.findByLastmodifiedbyName", query = "SELECT p FROM Parameter p WHERE p.lastmodifiedbyName = :lastmodifiedbyName"),
    @NamedQuery(name = "Parameter.findByLastmodifiedbyCd", query = "SELECT p FROM Parameter p WHERE p.lastmodifiedbyCd = :lastmodifiedbyCd")})
public class Parameter implements Serializable {
    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "ID")
    private Integer id;
    @Column(name = "CD")
    private String cd;
    @Column(name = "NAME")
    private String name;
    @Column(name = "VALUE")
    private String value;
    @Column(name = "DESCRIPTION")
    private String description;
    @Column(name = "ENABLED")
    private Boolean enabled;
    @Basic(optional = false)
    @Column(name = "CREATED")
    @Temporal(TemporalType.TIMESTAMP)
    private Date created;
    @Column(name = "CREATEDBY_ID")
    private Integer createdbyId;
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

    public Parameter() {
    }

    public Parameter(Integer id) {
        this.id = id;
    }

    public Parameter(Integer id, Date created) {
        this.id = id;
        this.created = created;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getCd() {
        return cd;
    }

    public void setCd(String cd) {
        this.cd = cd;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    public Integer getCreatedbyId() {
        return createdbyId;
    }

    public void setCreatedbyId(Integer createdbyId) {
        this.createdbyId = createdbyId;
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

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (id != null ? id.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof Parameter)) {
            return false;
        }
        Parameter other = (Parameter) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "mks.dms.dao.entity.Parameter[ id=" + id + " ]";
    }
    
}